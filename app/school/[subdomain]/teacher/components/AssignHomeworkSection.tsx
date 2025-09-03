"use client"

import React, { useState, useEffect } from "react";
import { uploadMultipleFiles, generateEntityId, validateFile, getFileIcon, formatFileSize, UploadedFile, UploadProgress } from "../../../../../lib/services/upload";
import { useAccessToken } from "../../../../../lib/hooks/useAuth";
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  FileText, 
  Image, 
  Video, 
  Archive, 
  Link, 
  Search, 
  Filter,
  X,
  ChevronDown,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Share2,
  MessageSquare,
  Bell,
  Target,
  Award,
  Star,
  Sparkles,
  Zap,
  Heart,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  FolderOpen,
  Send,
  CalendarDays,
  Timer,
  CheckSquare,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Info,
  Home
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  class: string;
  grade: string;
  type: 'homework' | 'project' | 'quiz' | 'test' | 'essay';
  dueDate: string;
  description: string;
  attachments: AssignmentAttachment[];
  points: number;
  status: 'draft' | 'published' | 'submitted' | 'graded';
  createdDate: string;
  isSelected?: boolean;
}

interface AssignmentAttachment {
  id: string;
  name: string;
  originalName: string;
  type: 'document' | 'image' | 'video' | 'link';
  mimeType?: string;
  size?: string;
  sizeBytes?: number;
  url?: string;
  path?: string;
  entityType?: 'assignment' | 'question' | 'submission';
  entityId?: string;
  uploadedAt?: string;
}

interface Recipient {
  id: string;
  name: string;
  type: 'student' | 'parent' | 'class' | 'class-parents';
  email?: string;
  phone?: string;
  class?: string;
  grade?: string;
  avatar?: string;
  isSelected?: boolean;
}

interface AssignHomeworkSectionProps {
  subdomain: string;
  onBack: () => void;
  onCreateTest?: () => void;
  newlyCreatedTest?: {
    title: string;
    subject: string;
    grade: string;
    date: string;
    startTime: string;
    duration: string;
  };
}

// Mock data for demonstration
const mockAssignments: Assignment[] = [
  {
    id: 'hw1',
    title: 'Algebra Chapter 5 Practice Problems',
    subject: 'Mathematics',
    class: '7A',
    grade: 'Grade 7',
    type: 'homework',
    dueDate: '2024-01-25',
    description: 'Complete problems 1-20 in Chapter 5. Show all work and submit your solutions.',
    attachments: [
      { id: 'att1', name: 'Chapter5_Problems.pdf', originalName: 'Chapter5_Problems.pdf', type: 'document', size: '2.1 MB' },
      { id: 'att2', name: 'Algebra_Formulas.pdf', originalName: 'Algebra_Formulas.pdf', type: 'document', size: '856 KB' }
    ],
    points: 25,
    status: 'published',
    createdDate: '2024-01-15'
  },
  {
    id: 'hw2',
    title: 'Science Lab Report - Chemical Reactions',
    subject: 'Science',
    class: '8B',
    grade: 'Grade 8',
    type: 'project',
    dueDate: '2024-01-30',
    description: 'Write a comprehensive lab report on the chemical reactions experiment conducted in class.',
    attachments: [
      { id: 'att3', name: 'Lab_Report_Template.docx', originalName: 'Lab_Report_Template.docx', type: 'document', size: '1.2 MB' },
      { id: 'att4', name: 'Experiment_Photos.zip', originalName: 'Experiment_Photos.zip', type: 'document', size: '8.5 MB' }
    ],
    points: 50,
    status: 'draft',
    createdDate: '2024-01-16'
  },
  {
    id: 'hw3',
    title: 'English Literature Essay - Shakespeare',
    subject: 'English',
    class: '9C',
    grade: 'Grade 9',
    type: 'essay',
    dueDate: '2024-01-28',
    description: 'Write a 1000-word essay analyzing the themes in Shakespeare\'s "Romeo and Juliet".',
    attachments: [
      { id: 'att5', name: 'Essay_Guidelines.pdf', originalName: 'Essay_Guidelines.pdf', type: 'document', size: '1.8 MB' },
      { id: 'att6', name: 'Romeo_Juliet_Text.pdf', originalName: 'Romeo_Juliet_Text.pdf', type: 'document', size: '3.2 MB' }
    ],
    points: 40,
    status: 'published',
    createdDate: '2024-01-14'
  },
  {
    id: 'hw4',
    title: 'History Timeline Project',
    subject: 'History',
    class: '10A',
    grade: 'Grade 10',
    type: 'project',
    dueDate: '2024-02-05',
    description: 'Create a visual timeline of major events during the Industrial Revolution.',
    attachments: [
      { id: 'att7', name: 'Timeline_Requirements.pdf', originalName: 'Timeline_Requirements.pdf', type: 'document', size: '1.5 MB' },
      { id: 'att8', name: 'Historical_Resources.zip', originalName: 'Historical_Resources.zip', type: 'document', size: '12.3 MB' }
    ],
    points: 35,
    status: 'draft',
    createdDate: '2024-01-17'
  }
];

const mockRecipients: Recipient[] = [
  // Students
  { id: 's1', name: 'John Smith', type: 'student', email: 'john.smith@school.com', class: '7A', grade: 'Grade 7' },
  { id: 's2', name: 'Sarah Johnson', type: 'student', email: 'sarah.johnson@school.com', class: '7A', grade: 'Grade 7' },
  { id: 's3', name: 'Michael Brown', type: 'student', email: 'michael.brown@school.com', class: '8B', grade: 'Grade 8' },
  { id: 's4', name: 'Emma Davis', type: 'student', email: 'emma.davis@school.com', class: '8B', grade: 'Grade 8' },
  
  // Parents
  { id: 'p1', name: 'Mr. & Mrs. Smith', type: 'parent', email: 'smith.parents@email.com', phone: '+1234567890' },
  { id: 'p2', name: 'Mrs. Johnson', type: 'parent', email: 'johnson.parent@email.com', phone: '+1234567891' },
  { id: 'p3', name: 'Mr. Brown', type: 'parent', email: 'brown.parent@email.com', phone: '+1234567892' },
  { id: 'p4', name: 'Mr. & Mrs. Davis', type: 'parent', email: 'davis.parents@email.com', phone: '+1234567893' },
  
  // Classes
  { id: 'c1', name: 'Class 7A (All Students)', type: 'class', class: '7A', grade: 'Grade 7' },
  { id: 'c2', name: 'Class 8B (All Students)', type: 'class', class: '8B', grade: 'Grade 8' },
  { id: 'c3', name: 'Class 9C (All Students)', type: 'class', class: '9C', grade: 'Grade 9' },
  { id: 'c4', name: 'Class 10A (All Students)', type: 'class', class: '10A', grade: 'Grade 10' },
  
  // Class Parents
  { id: 'cp1', name: 'Parents of Class 7A', type: 'class-parents', class: '7A', grade: 'Grade 7' },
  { id: 'cp2', name: 'Parents of Class 8B', type: 'class-parents', class: '8B', grade: 'Grade 8' },
  { id: 'cp3', name: 'Parents of Class 9C', type: 'class-parents', class: '9C', grade: 'Grade 9' },
  { id: 'cp4', name: 'Parents of Class 10A', type: 'class-parents', class: '10A', grade: 'Grade 10' },
];

export default function AssignHomeworkSection({ subdomain, onBack, onCreateTest, newlyCreatedTest }: AssignHomeworkSectionProps) {
  const accessToken = useAccessToken();
  const [step, setStep] = useState<'assignments' | 'recipients' | 'preview'>('assignments');
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'project' | 'quiz' | 'test' | 'essay'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'submitted' | 'graded'>('all');
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [recipientFilterType, setRecipientFilterType] = useState<'all' | 'student' | 'parent' | 'class' | 'class-parents'>('all');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [assigningHomework, setAssigningHomework] = useState(false);
  const [homeworkAssigned, setHomeworkAssigned] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [completedUploads, setCompletedUploads] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    points: 25,
    grade: '',
    class: ''
  });

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || assignment.type === filterType;
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredRecipients = mockRecipients.filter(recipient => {
    const matchesSearch = recipient.name.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
                        recipient.email?.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
                        recipient.class?.toLowerCase().includes(recipientSearchTerm.toLowerCase());
    const matchesFilter = recipientFilterType === 'all' || recipient.type === recipientFilterType;
    return matchesSearch && matchesFilter;
  });

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case 'homework': return <BookOpen className="w-5 h-5" />;
      case 'project': return <Target className="w-5 h-5" />;
      case 'quiz': return <CheckSquare className="w-5 h-5" />;
      case 'test': return <ClipboardList className="w-5 h-5" />;
      case 'essay': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-yellow-100 text-yellow-800';
      case 'test': return 'bg-red-100 text-red-800';
      case 'essay': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'parent': return <Users className="w-4 h-4" />;
      case 'class': return <GraduationCap className="w-4 h-4" />;
      case 'class-parents': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      case 'class': return 'Class';
      case 'class-parents': return 'Class Parents';
      default: return 'Unknown';
    }
  };

  const handleAssignmentToggle = (assignment: Assignment) => {
    setSelectedAssignments(prev => {
      const isSelected = prev.some(a => a.id === assignment.id);
      if (isSelected) {
        return prev.filter(a => a.id !== assignment.id);
      } else {
        return [...prev, { ...assignment, isSelected: true }];
      }
    });
  };

  const handleRecipientToggle = (recipient: Recipient) => {
    setSelectedRecipients(prev => {
      const isSelected = prev.some(r => r.id === recipient.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipient.id);
      } else {
        return [...prev, { ...recipient, isSelected: true }];
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files before adding
    const validFiles: File[] = [];
    const errors: Record<string, string> = {};
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors[file.name] = validation.error || 'Invalid file';
      }
    });
    
    setUploadErrors(prev => ({ ...prev, ...errors }));
    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Initialize progress tracking for valid files
    const progressEntries: Record<string, UploadProgress> = {};
    validFiles.forEach(file => {
      progressEntries[file.name] = {
        fileName: file.name,
        progress: 0,
        status: 'pending'
      };
    });
    setUploadProgress(prev => ({ ...prev, ...progressEntries }));
  };

  const handleUploadFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    console.log('Starting upload with access token:', accessToken);
    
    if (!accessToken) {
      setUploadErrors({ general: 'Authentication token not available. Please refresh the page.' });
      return;
    }
    
    setIsUploading(true);
    setUploadErrors({});
    
    try {
      // Generate entity ID for this assignment
      const entityId = generateEntityId();
      
      console.log('Generated entity ID:', entityId);
      
      // Get access token from auth hook
      const token = accessToken;
      
      const results = await uploadMultipleFiles(
        uploadedFiles,
        'assignment',
        entityId,
        newAssignment.description || 'Homework assignment files',
        token,
        // Progress callback
        (fileName, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: {
              ...prev[fileName],
              progress,
              status: 'uploading'
            }
          }));
        },
        // Success callback
        (fileName, result) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: {
              ...prev[fileName],
              progress: 100,
              status: 'completed'
            }
          }));
          setCompletedUploads(prev => [...prev, result]);
        },
        // Error callback
        (fileName, error) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: {
              ...prev[fileName],
              status: 'error',
              error
            }
          }));
          setUploadErrors(prev => ({ ...prev, [fileName]: error }));
        }
      );
      
      // Create new assignment with uploaded files
      if (results.length > 0) {
        const attachments: AssignmentAttachment[] = results.map(file => ({
          id: file.id,
          name: file.fileName,
          originalName: file.originalName,
          type: file.mimeType.startsWith('image/') ? 'image' : 
                file.mimeType.startsWith('video/') ? 'video' : 'document',
          mimeType: file.mimeType,
          size: formatFileSize(file.size),
          sizeBytes: file.size,
          url: file.url,
          path: file.path,
          entityType: file.entityType,
          entityId: file.entityId,
          uploadedAt: file.uploadedAt
        }));
        
        const newAssignmentData: Assignment = {
          id: entityId,
          title: newAssignment.title || 'New Assignment',
          subject: newAssignment.subject || 'General',
          class: newAssignment.class || 'All Classes',
          grade: newAssignment.grade || 'All Grades',
          type: 'homework',
          dueDate: newAssignment.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: newAssignment.description || 'Assignment with uploaded files',
          attachments,
          points: newAssignment.points,
          status: 'draft',
          createdDate: new Date().toISOString().split('T')[0],
          isSelected: true
        };
        
        // Add to selected assignments
        setSelectedAssignments([newAssignmentData]);
        
        // Reset form
        setNewAssignment({
          title: '',
          subject: '',
          description: '',
          dueDate: '',
          points: 25,
          grade: '',
          class: ''
        });
        setUploadedFiles([]);
        setShowUploadModal(false);
        
        // Move to recipients step
        setStep('recipients');
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Upload failed' 
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileToRemove.name];
      return updated;
    });
    setUploadErrors(prev => {
      const updated = { ...prev };
      delete updated[fileToRemove.name];
      return updated;
    });
  };

  const handleAssignHomework = async () => {
    setAssigningHomework(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAssigningHomework(false);
    setHomeworkAssigned(true);
    setTimeout(() => {
      setHomeworkAssigned(false);
      onBack();
    }, 2000);
  };

  const renderAssignmentSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Assign Homework</h2>
        <p className="text-muted-foreground">Select existing assignments or create new ones</p>
      </div>

      {/* Newly Created Test Highlight */}
      {newlyCreatedTest && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Newly Created Test</h3>
              <p className="text-sm text-green-700">Ready to assign to students</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="font-medium text-foreground mb-1">{newlyCreatedTest.title}</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Subject: {newlyCreatedTest.subject}</div>
              <div>Grade: {newlyCreatedTest.grade}</div>
              <div>Date: {newlyCreatedTest.date} at {newlyCreatedTest.startTime}</div>
              <div>Duration: {newlyCreatedTest.duration} minutes</div>
            </div>
            <button
              onClick={() => {
                // Add the newly created test to selected assignments
                const newTest: Assignment = {
                  id: 'new-test',
                  title: newlyCreatedTest.title,
                  subject: newlyCreatedTest.subject,
                  class: newlyCreatedTest.grade,
                  grade: newlyCreatedTest.grade,
                  type: 'test',
                  dueDate: newlyCreatedTest.date,
                  description: `Newly created test for ${newlyCreatedTest.subject}`,
                  attachments: [],
                  points: 100,
                  status: 'published',
                  createdDate: new Date().toISOString().split('T')[0],
                  isSelected: true
                };
                setSelectedAssignments([newTest]);
                setStep('recipients');
              }}
              className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Assign This Test Now
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Upload className="w-5 h-5" />
          <span className="font-semibold">Upload Assignment</span>
        </button>
        
        <button
          onClick={onCreateTest}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Create New Assignment</span>
        </button>
      </div>

      {/* Enhanced Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Create New Assignment</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFiles([]);
                  setUploadProgress({});
                  setUploadErrors({});
                  setNewAssignment({
                    title: '',
                    subject: '',
                    description: '',
                    dueDate: '',
                    points: 25,
                    grade: '',
                    class: ''
                  });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Assignment Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Assignment Title *</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title"
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                  <input
                    type="text"
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Science"
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Grade/Class</label>
                  <input
                    type="text"
                    value={newAssignment.grade}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="e.g., Grade 7, 7A"
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Points</label>
                  <input
                    type="number"
                    value={newAssignment.points}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, points: parseInt(e.target.value) || 25 }))}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the assignment, instructions, and requirements..."
                    rows={3}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assignment Files</label>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload assignment files, worksheets, or resources
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Supported: Images, PDFs, Documents, Videos (Max 50MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,video/*,audio/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors inline-block"
                  >
                    Choose Files
                  </label>
                </div>
              </div>
              
              {/* Upload Errors */}
              {Object.keys(uploadErrors).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Upload Errors:</h4>
                  {Object.entries(uploadErrors).map(([fileName, error]) => (
                    <div key={fileName} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-red-700">{fileName}:</span>
                        <span className="text-red-600 ml-1">{error}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Uploaded Files with Progress */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Files to Upload ({uploadedFiles.length}):</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => {
                      const progress = uploadProgress[file.name];
                      const hasError = uploadErrors[file.name];
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg">{getFileIcon(file.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                            </div>
                            
                            {progress && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`capitalize ${
                                    progress.status === 'completed' ? 'text-green-600' :
                                    progress.status === 'error' ? 'text-red-600' :
                                    progress.status === 'uploading' ? 'text-blue-600' :
                                    'text-muted-foreground'
                                  }`}>
                                    {progress.status}
                                  </span>
                                  {progress.status === 'uploading' && (
                                    <span className="text-muted-foreground">{progress.progress}%</span>
                                  )}
                                </div>
                                {(progress.status === 'uploading' || progress.status === 'completed') && (
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                      className={`h-1 rounded-full transition-all duration-300 ${
                                        progress.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${progress.progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {!isUploading && (
                            <button
                              onClick={() => removeUploadedFile(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Debug Info */}
              <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                Auth Status: {accessToken ? '✅ Token Available' : '❌ No Token'} | 
                Files: {uploadedFiles.length} | 
                Title: {newAssignment.title ? '✅' : '❌'} | 
                Subject: {newAssignment.subject ? '✅' : '❌'}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFiles([]);
                    setUploadProgress({});
                    setUploadErrors({});
                  }}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadFiles}
                  disabled={isUploading || uploadedFiles.length === 0 || !newAssignment.title.trim() || !newAssignment.subject.trim() || !accessToken}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Create & Upload Assignment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'homework', 'project', 'quiz', 'test', 'essay'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filterType === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/50 text-foreground/70 border border-primary/20 hover:bg-primary/5'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'published', 'submitted', 'graded'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filterStatus === status
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/50 text-foreground/70 border border-primary/20 hover:bg-primary/5'
              }`}
            >
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map(assignment => (
          <div
            key={assignment.id}
            onClick={() => handleAssignmentToggle(assignment)}
            className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAssignments.some(a => a.id === assignment.id)
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-primary/20 bg-white/50 hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getAssignmentTypeColor(assignment.type)}`}>
                {getAssignmentIcon(assignment.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{assignment.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {assignment.subject} • {assignment.class} • {assignment.grade}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {assignment.description}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{assignment.points} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{assignment.attachments.length} files</span>
                  </div>
                </div>
              </div>
            </div>
            {selectedAssignments.some(a => a.id === assignment.id) && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Assignments Summary */}
      {selectedAssignments.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Selected Assignments ({selectedAssignments.length})</span>
            <button
              onClick={() => setSelectedAssignments([])}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAssignments.map(assignment => (
              <div
                key={assignment.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/20 text-sm"
              >
                <span>{assignment.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignmentToggle(assignment);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('recipients')}
          disabled={selectedAssignments.length === 0}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue ({selectedAssignments.length} selected)
        </button>
      </div>
    </div>
  );

  const renderRecipientSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Recipients</h2>
        <p className="text-muted-foreground">Choose who to assign the homework to</p>
      </div>

      {/* Selected Assignments Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Assignments to Share ({selectedAssignments.length})</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedAssignments.map(a => a.title).join(', ')}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search recipients..."
            value={recipientSearchTerm}
            onChange={(e) => setRecipientSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'student', 'parent', 'class', 'class-parents'] as const).map(type => (
            <button
              key={type}
              onClick={() => setRecipientFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                recipientFilterType === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/50 text-foreground/70 border border-primary/20 hover:bg-primary/5'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>
      </div>

      {/* Recipients List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredRecipients.map(recipient => (
          <div
            key={recipient.id}
            onClick={() => handleRecipientToggle(recipient)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedRecipients.some(r => r.id === recipient.id)
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-primary/20 bg-white/50 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedRecipients.some(r => r.id === recipient.id)
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {getRecipientIcon(recipient.type)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{recipient.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {getRecipientTypeLabel(recipient.type)}
                    </span>
                    {recipient.class && <span>{recipient.class}</span>}
                    {recipient.email && <span>• {recipient.email}</span>}
                  </div>
                </div>
              </div>
              {selectedRecipients.some(r => r.id === recipient.id) && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Recipients Summary */}
      {selectedRecipients.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Selected Recipients ({selectedRecipients.length})</span>
            <button
              onClick={() => setSelectedRecipients([])}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRecipients.map(recipient => (
              <div
                key={recipient.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/20 text-sm"
              >
                <span>{recipient.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecipientToggle(recipient);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Message */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Assignment Message (Optional)</label>
        <textarea
          value={assignmentMessage}
          onChange={(e) => setAssignmentMessage(e.target.value)}
          placeholder="Add a personal message or instructions for the assignment..."
          rows={3}
          className="w-full px-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep('assignments')}
          className="px-6 py-3 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('preview')}
            disabled={selectedRecipients.length === 0}
            className="px-6 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleAssignHomework}
            disabled={selectedRecipients.length === 0 || assigningHomework}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {assigningHomework ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Assign Homework
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Preview Assignment</h2>
        <p className="text-muted-foreground">Review your homework assignment before sending</p>
      </div>

      <div className="bg-white border border-primary/20 rounded-lg p-6 shadow-sm">
        <div className="space-y-6">
          {/* Assignments */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Assignments to Assign ({selectedAssignments.length})
            </h3>
            <div className="space-y-3">
              {selectedAssignments.map(assignment => (
                <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getAssignmentTypeColor(assignment.type)}`}>
                      {getAssignmentIcon(assignment.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{assignment.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {assignment.subject} • {assignment.class} • Due: {assignment.dueDate}
                      </div>
                      <div className="text-sm text-muted-foreground">{assignment.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{assignment.points} pts</div>
                      <div className="text-xs text-muted-foreground">{assignment.attachments.length} files</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Recipients ({selectedRecipients.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedRecipients.map(recipient => (
                <div key={recipient.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1 rounded-full bg-primary/10">
                    {getRecipientIcon(recipient.type)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{recipient.name}</div>
                    <div className="text-xs text-muted-foreground">{getRecipientTypeLabel(recipient.type)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {assignmentMessage && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Assignment Message
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-foreground">{assignmentMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep('recipients')}
          className="px-6 py-3 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
        >
          Back to Edit
        </button>
        <button
          onClick={handleAssignHomework}
          disabled={assigningHomework}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {assigningHomework ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Assigning...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Assign Homework
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (homeworkAssigned) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Homework Assigned Successfully!</h2>
          <p className="text-muted-foreground">
            Your {selectedAssignments.length} assignment{selectedAssignments.length !== 1 ? 's' : ''} have been assigned to {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Return to Main Menu Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-primary/90 text-white font-semibold rounded-lg hover:bg-primary transition-all duration-300 shadow-lg"
        >
          <Home className="w-4 h-4" />
          Return to Main Menu
        </button>
      </div>
      
      {step === 'assignments' && renderAssignmentSelection()}
      {step === 'recipients' && renderRecipientSelection()}
      {step === 'preview' && renderPreview()}
    </div>
  );
} 