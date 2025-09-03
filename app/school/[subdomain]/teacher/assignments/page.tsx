"use client"

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  ArrowUpDown
} from "lucide-react";
import { graphqlClient } from "@/lib/graphql-client";
import { DynamicLogo } from '../../parent/components/DynamicLogo';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams, useRouter } from 'next/navigation';

// TypeScript interfaces for the assignment data based on the myAssignMents API response structure
interface Assignment {
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
  duration: number;
  totalMarks: number;
  status: 'draft' | 'published' | 'completed';
  questions: Array<{
    id: string;
    text: string;
    marks: number;
    type: 'multiple_choice' | 'short_answer' | 'true_false';
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
  referenceMaterials: Array<{
    id: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentsResponse {
  myAssignMents: Assignment[];
}

// GraphQL query to get assignments for the current teacher
const GET_MY_ASSIGNMENTS_QUERY = `
  query MyAssignMents {
    myAssignMents {
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
      duration
      totalMarks
      status
      questions {
        id
        text
        marks
        type
        options {
          id
          text
          isCorrect
        }
      }
      referenceMaterials {
        id
        fileUrl
        fileType
        fileSize
      }
      createdAt
      updatedAt
    }
  }
`;

export default function AssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';

  // State management
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'subject' | 'grade'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch assignments on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await graphqlClient.request<AssignmentsResponse>(GET_MY_ASSIGNMENTS_QUERY);
        setAssignments(response.myAssignMents || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Get unique values for filters
  const uniqueGrades = Array.from(
    new Set(
      assignments.flatMap(assignment => 
        assignment.gradeLevels.map(gradeLevel => gradeLevel.gradeLevel.name)
      )
    )
  ).sort();

  const uniqueSubjects = Array.from(
    new Set(assignments.map(assignment => assignment.subject.subject.name))
  ).sort();

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = selectedGrade === "all" || 
                        assignment.gradeLevels.some(gradeLevel => gradeLevel.gradeLevel.name === selectedGrade);
    
    const matchesSubject = selectedSubject === "all" || 
                          assignment.subject.subject.name === selectedSubject;
    
    const matchesStatus = selectedStatus === "all" || 
                         assignment.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesSubject && matchesStatus;
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'subject':
        aValue = a.subject.subject.name.toLowerCase();
        bValue = b.subject.subject.name.toLowerCase();
        break;
      case 'grade':
        aValue = a.gradeLevels.map(g => g.gradeLevel.name).sort().join(', ').toLowerCase();
        bValue = b.gradeLevels.map(g => g.gradeLevel.name).sort().join(', ').toLowerCase();
        break;
      case 'date':
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Group assignments by grade for better organization
  const groupedByGrade = sortedAssignments.reduce((groups, assignment) => {
    assignment.gradeLevels.forEach(gradeLevel => {
      const gradeName = gradeLevel.gradeLevel.name;
      if (!groups[gradeName]) {
        groups[gradeName] = [];
      }
      if (!groups[gradeName].some(a => a.id === assignment.id)) {
        groups[gradeName].push(assignment);
      }
    });
    return groups;
  }, {} as Record<string, Assignment[]>);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Assignments</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <BookOpen className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Assignments & Tests
                </h1>
                <p className="text-sm text-muted-foreground/90 font-medium">
                  Manage and review your assignments and tests
                </p>
              </div>
            </div>
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => {
                // Navigate to create test/assignment page
                window.location.href = `/school/${subdomain}/teacher`;
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full flex justify-center py-6 mb-8">
            <DynamicLogo subdomain={subdomain} size="lg" showText={true} />
          </div>

          {/* Filters and Search */}
          <Card className="mb-6 border-primary/20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 border-primary/20 focus:border-primary"
                />
              </div>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {uniqueGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedGrade("all");
                      setSelectedSubject("all");
                      setSelectedStatus("all");
                    }}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Table */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Assignments ({sortedAssignments.length})
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/20 hover:bg-primary/5">
                      <TableHead 
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          Title
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleSort('subject')}
                      >
                        <div className="flex items-center gap-2">
                          Subject
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleSort('grade')}
                      >
                        <div className="flex items-center gap-2">
                          Grades
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-12 h-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No assignments found</p>
                            <p className="text-sm text-muted-foreground/70">
                              {assignments.length === 0 ? 'Create your first assignment to get started' : 'Try adjusting your filters'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedAssignments.map((assignment) => (
                        <TableRow key={assignment.id} className="border-primary/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <button
                                onClick={() => router.push(`assignments/${assignment.id}`)}
                                className="font-semibold text-foreground hover:text-primary transition-colors text-left"
                              >
                                {assignment.title}
                              </button>
                              <div className="text-xs text-muted-foreground">
                                {assignment.questions.length} questions • {assignment.totalMarks} marks
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              {assignment.subject.subject.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {formatDate(assignment.date)}
                              {assignment.startTime && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {assignment.startTime}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {assignment.duration} min
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{assignment.totalMarks} pts</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${getStatusBadgeColor(assignment.status)} border`}
                            >
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {assignment.questions.length} questions
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-primary/10"
                                onClick={() => {
                                  router.push(`assignments/${assignment.id}`);
                                }}
                                title="View Assignment"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-primary/10"
                                onClick={() => {
                                  // Edit assignment
                                  console.log('Edit assignment:', assignment.id);
                                  // TODO: Navigate to assignment edit page
                                }}
                                title="Edit Assignment"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-red-100 hover:text-red-600"
                                onClick={() => {
                                  // Delete assignment with confirmation
                                  if (window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
                                    console.log('Delete assignment:', assignment.id);
                                    // TODO: Implement delete functionality
                                  }
                                }}
                                title="Delete Assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
