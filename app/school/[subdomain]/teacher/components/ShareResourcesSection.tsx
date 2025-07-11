"use client"

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Link, 
  Users, 
  User, 
  Building2, 
  GraduationCap, 
  Search, 
  Filter,
  X,
  ChevronDown,
  Eye,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  FolderOpen,
  BookOpen,
  Calendar,
  Star,
  Award,
  MapPin,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  Trash2,
  Edit3,
  MoreHorizontal,
  Sparkles,
  Zap,
  Heart,
  Bookmark,
  MessageSquare,
  Home
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'link';
  size?: string;
  url?: string;
  description?: string;
  tags: string[];
  uploadDate: string;
  isSelected?: boolean;
}

interface Recipient {
  id: string;
  name: string;
  type: 'student' | 'parent' | 'admin' | 'teacher' | 'class' | 'class-parents';
  email?: string;
  phone?: string;
  class?: string;
  grade?: string;
  department?: string;
  avatar?: string;
  isSelected?: boolean;
}

interface ShareResourcesSectionProps {
  subdomain: string;
  onBack: () => void;
}

// Mock data for demonstration
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
  
  // Teachers
  { id: 't1', name: 'Dr. Sarah Wilson', type: 'teacher', email: 'sarah.wilson@school.com', department: 'Mathematics' },
  { id: 't2', name: 'Mr. James Rodriguez', type: 'teacher', email: 'james.rodriguez@school.com', department: 'Science' },
  { id: 't3', name: 'Ms. Emily Chen', type: 'teacher', email: 'emily.chen@school.com', department: 'English' },
  { id: 't4', name: 'Prof. David Thompson', type: 'teacher', email: 'david.thompson@school.com', department: 'History' },
  
  // Admins
  { id: 'a1', name: 'Principal Wilson', type: 'admin', email: 'principal@school.com', phone: '+1234567894' },
  { id: 'a2', name: 'Vice Principal Garcia', type: 'admin', email: 'vice.principal@school.com', phone: '+1234567895' },
  { id: 'a3', name: 'School Secretary', type: 'admin', email: 'secretary@school.com', phone: '+1234567896' },
  
  // Classes
  { id: 'c1', name: 'Class 7A (All Students)', type: 'class', class: '7A', grade: 'Grade 7' },
  { id: 'c2', name: 'Class 8B (All Students)', type: 'class', class: '8B', grade: 'Grade 8' },
  { id: 'c3', name: 'Class 9C (All Students)', type: 'class', class: '9C', grade: 'Grade 9' },
  
  // Class Parents
  { id: 'cp1', name: 'Parents of Class 7A', type: 'class-parents', class: '7A', grade: 'Grade 7' },
  { id: 'cp2', name: 'Parents of Class 8B', type: 'class-parents', class: '8B', grade: 'Grade 8' },
  { id: 'cp3', name: 'Parents of Class 9C', type: 'class-parents', class: '9C', grade: 'Grade 9' },
];

const mockResources: Resource[] = [
  {
    id: 'r1',
    name: 'Algebra Homework Solutions.pdf',
    type: 'document',
    size: '2.4 MB',
    description: 'Complete solutions for Chapter 5 algebra problems',
    tags: ['mathematics', 'algebra', 'homework', 'solutions'],
    uploadDate: '2024-01-15'
  },
  {
    id: 'r2',
    name: 'Science Lab Safety Guidelines.pdf',
    type: 'document',
    size: '1.8 MB',
    description: 'Comprehensive safety guidelines for laboratory experiments',
    tags: ['science', 'safety', 'laboratory', 'guidelines'],
    uploadDate: '2024-01-14'
  },
  {
    id: 'r3',
    name: 'Literature Reading List.docx',
    type: 'document',
    size: '856 KB',
    description: 'Recommended reading list for English Literature class',
    tags: ['english', 'literature', 'reading', 'books'],
    uploadDate: '2024-01-13'
  },
  {
    id: 'r4',
    name: 'Chemistry Experiment Video.mp4',
    type: 'video',
    size: '45.2 MB',
    description: 'Video demonstration of chemical reaction experiments',
    tags: ['chemistry', 'experiment', 'video', 'demonstration'],
    uploadDate: '2024-01-12'
  },
  {
    id: 'r5',
    name: 'Math Formulas Reference.png',
    type: 'image',
    size: '3.1 MB',
    description: 'Quick reference sheet with common mathematical formulas',
    tags: ['mathematics', 'formulas', 'reference', 'cheat-sheet'],
    uploadDate: '2024-01-11'
  },
  {
    id: 'r6',
    name: 'History Timeline Infographic.jpg',
    type: 'image',
    size: '5.7 MB',
    description: 'Visual timeline of important historical events',
    tags: ['history', 'timeline', 'infographic', 'visual'],
    uploadDate: '2024-01-10'
  },
  {
    id: 'r7',
    name: 'Study Resources Collection.zip',
    type: 'archive',
    size: '12.3 MB',
    description: 'Compressed collection of study materials and practice tests',
    tags: ['study', 'materials', 'practice', 'tests'],
    uploadDate: '2024-01-09'
  },
  {
    id: 'r8',
    name: 'Online Learning Platform',
    type: 'link',
    url: 'https://khanacademy.org',
    description: 'Comprehensive online learning platform with interactive exercises',
    tags: ['online', 'learning', 'platform', 'interactive'],
    uploadDate: '2024-01-08'
  }
];

export default function ShareResourcesSection({ subdomain, onBack }: ShareResourcesSectionProps) {
  const [step, setStep] = useState<'resources' | 'recipients' | 'preview'>('resources');
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'parent' | 'admin' | 'teacher' | 'class' | 'class-parents'>('all');
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [resourceFilterType, setResourceFilterType] = useState<'all' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'link'>('all');
  const [shareMessage, setShareMessage] = useState('');
  const [sharingResources, setSharingResources] = useState(false);
  const [resourcesShared, setResourcesShared] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const filteredRecipients = mockRecipients.filter(recipient => {
    const matchesSearch = recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        recipient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        recipient.class?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || recipient.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
                        resource.description?.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
                        resource.tags.some(tag => tag.toLowerCase().includes(resourceSearchTerm.toLowerCase()));
    const matchesFilter = resourceFilterType === 'all' || resource.type === resourceFilterType;
    return matchesSearch && matchesFilter;
  });

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'parent': return <Users className="w-4 h-4" />;
      case 'admin': return <Building2 className="w-4 h-4" />;
      case 'teacher': return <User className="w-4 h-4" />;
      case 'class': return <GraduationCap className="w-4 h-4" />;
      case 'class-parents': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      case 'admin': return 'Admin';
      case 'teacher': return 'Teacher';
      case 'class': return 'Class';
      case 'class-parents': return 'Class Parents';
      default: return 'Unknown';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'archive': return <Archive className="w-5 h-5" />;
      case 'link': return <Link className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'audio': return 'bg-orange-100 text-orange-800';
      case 'archive': return 'bg-gray-100 text-gray-800';
      case 'link': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResourceToggle = (resource: Resource) => {
    setSelectedResources(prev => {
      const isSelected = prev.some(r => r.id === resource.id);
      if (isSelected) {
        return prev.filter(r => r.id !== resource.id);
      } else {
        return [...prev, { ...resource, isSelected: true }];
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
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleShareResources = async () => {
    setSharingResources(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSharingResources(false);
    setResourcesShared(true);
    setTimeout(() => {
      setResourcesShared(false);
      onBack();
    }, 2000);
  };

  const renderResourceSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Resources to Share</h2>
        <p className="text-muted-foreground">Choose the resources you'd like to share</p>
      </div>

      {/* Upload New Resources */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upload New Resources</h3>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Recently Uploaded:</h4>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/20 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search resources..."
            value={resourceSearchTerm}
            onChange={(e) => setResourceSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'document', 'image', 'video', 'audio', 'archive', 'link'] as const).map(type => (
            <button
              key={type}
              onClick={() => setResourceFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                resourceFilterType === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/50 text-foreground/70 border border-primary/20 hover:bg-primary/5'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <div
            key={resource.id}
            onClick={() => handleResourceToggle(resource)}
            className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedResources.some(r => r.id === resource.id)
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-primary/20 bg-white/50 hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{resource.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{resource.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{resource.size}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{resource.uploadDate}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {resource.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 2 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                      +{resource.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selectedResources.some(r => r.id === resource.id) && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Resources Summary */}
      {selectedResources.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Selected Resources ({selectedResources.length})</span>
            <button
              onClick={() => setSelectedResources([])}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedResources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/20 text-sm"
              >
                <span>{resource.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResourceToggle(resource);
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
          disabled={selectedResources.length === 0}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue ({selectedResources.length} selected)
        </button>
      </div>
    </div>
  );

  const renderRecipientSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Recipients</h2>
        <p className="text-muted-foreground">Choose who you'd like to share resources with</p>
      </div>

      {/* Selected Resources Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Resources to Share ({selectedResources.length})</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedResources.map(r => r.name).join(', ')}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'student', 'parent', 'admin', 'teacher', 'class', 'class-parents'] as const).map(type => (
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

      {/* Share Message */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Share Message (Optional)</label>
        <textarea
          value={shareMessage}
          onChange={(e) => setShareMessage(e.target.value)}
          placeholder="Add a personal message to accompany the shared resources..."
          rows={3}
          className="w-full px-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep('resources')}
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
            onClick={handleShareResources}
            disabled={selectedRecipients.length === 0 || sharingResources}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sharingResources ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share Resources
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Preview Share</h2>
        <p className="text-muted-foreground">Review your resource share before sending</p>
      </div>

      <div className="bg-white border border-primary/20 rounded-lg p-6 shadow-sm">
        <div className="space-y-6">
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Resources to Share ({selectedResources.length})
            </h3>
            <div className="space-y-2">
              {selectedResources.map(resource => (
                <div key={resource.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{resource.name}</div>
                    <div className="text-sm text-muted-foreground">{resource.description}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{resource.size}</div>
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
          {shareMessage && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Share Message
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-foreground">{shareMessage}</p>
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
          onClick={handleShareResources}
          disabled={sharingResources}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {sharingResources ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share Resources
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (resourcesShared) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Resources Shared Successfully!</h2>
          <p className="text-muted-foreground">
            Your {selectedResources.length} resource{selectedResources.length !== 1 ? 's' : ''} have been shared with {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}.
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
      
      {step === 'resources' && renderResourceSelection()}
      {step === 'recipients' && renderRecipientSelection()}
      {step === 'preview' && renderPreview()}
    </div>
  );
} 