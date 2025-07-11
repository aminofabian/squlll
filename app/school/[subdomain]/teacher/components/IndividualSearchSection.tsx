"use client"

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Star,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Eye,
  MessageSquare,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Info,
  Home
} from "lucide-react";

interface Individual {
  id: string;
  name: string;
  type: 'teacher' | 'student';
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  class?: string;
  grade?: string;
  subjects?: string[];
  achievements?: string[];
  status: 'active' | 'inactive' | 'on_leave';
  lastActive?: string;
  rating?: number;
  bio?: string;
  location?: string;
  joinDate?: string;
  isSelected?: boolean;
}

interface IndividualSearchSectionProps {
  subdomain: string;
  onBack: () => void;
  onSelect?: (individual: Individual) => void;
}

// Mock data for demonstration
const mockIndividuals: Individual[] = [
  // Teachers
  {
    id: 't1',
    name: 'Dr. Sarah Wilson',
    type: 'teacher',
    email: 'sarah.wilson@school.com',
    phone: '+1234567890',
    department: 'Mathematics',
    subjects: ['Algebra', 'Calculus', 'Statistics'],
    achievements: ['Teacher of the Year 2023', 'Excellence in Education Award'],
    status: 'active',
    lastActive: '2 hours ago',
    rating: 4.8,
    bio: 'Passionate mathematics educator with 8 years of experience. Specializes in making complex concepts accessible to all students.',
    location: 'Room 201, Building A',
    joinDate: '2020-09-01'
  },
  {
    id: 't2',
    name: 'Mr. James Rodriguez',
    type: 'teacher',
    email: 'james.rodriguez@school.com',
    phone: '+1234567891',
    department: 'Science',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    achievements: ['Innovation in Teaching Award'],
    status: 'active',
    lastActive: '1 day ago',
    rating: 4.6,
    bio: 'Experienced science teacher with a focus on hands-on learning and laboratory experiments.',
    location: 'Lab 105, Building B',
    joinDate: '2019-08-15'
  },
  {
    id: 't3',
    name: 'Ms. Emily Chen',
    type: 'teacher',
    email: 'emily.chen@school.com',
    phone: '+1234567892',
    department: 'English',
    subjects: ['Literature', 'Creative Writing', 'Grammar'],
    achievements: ['Creative Teaching Excellence'],
    status: 'on_leave',
    lastActive: '1 week ago',
    rating: 4.9,
    bio: 'Literature enthusiast who believes in the power of storytelling to inspire young minds.',
    location: 'Room 305, Building A',
    joinDate: '2021-01-10'
  },
  {
    id: 't4',
    name: 'Prof. David Thompson',
    type: 'teacher',
    email: 'david.thompson@school.com',
    phone: '+1234567893',
    department: 'History',
    subjects: ['World History', 'American History', 'Geography'],
    achievements: ['Historical Research Grant', 'Outstanding Educator'],
    status: 'active',
    lastActive: '3 hours ago',
    rating: 4.7,
    bio: 'History buff with a talent for making the past come alive through engaging storytelling.',
    location: 'Room 401, Building C',
    joinDate: '2018-03-20'
  },

  // Students
  {
    id: 's1',
    name: 'Alexandra "Alex" Martinez',
    type: 'student',
    email: 'alex.martinez@school.com',
    class: '10A',
    grade: 'Grade 10',
    subjects: ['Mathematics', 'Science', 'English', 'History'],
    achievements: ['Honor Roll', 'Science Fair Winner', 'Debate Team Captain'],
    status: 'active',
    lastActive: '1 hour ago',
    rating: 4.9,
    bio: 'Ambitious student with a passion for science and leadership. Excels in both academics and extracurricular activities.',
    location: 'Building A, Floor 2',
    joinDate: '2020-09-01'
  },
  {
    id: 's2',
    name: 'Marcus Johnson',
    type: 'student',
    email: 'marcus.johnson@school.com',
    class: '9B',
    grade: 'Grade 9',
    subjects: ['Mathematics', 'Physical Education', 'Art', 'Music'],
    achievements: ['Sports Captain', 'Art Competition Winner'],
    status: 'active',
    lastActive: '30 minutes ago',
    rating: 4.5,
    bio: 'Athletic and creative student who balances sports with artistic pursuits. Natural leader on the field.',
    location: 'Building B, Floor 1',
    joinDate: '2021-09-01'
  },
  {
    id: 's3',
    name: 'Sophia Williams',
    type: 'student',
    email: 'sophia.williams@school.com',
    class: '11C',
    grade: 'Grade 11',
    subjects: ['Advanced Mathematics', 'Physics', 'Computer Science', 'Literature'],
    achievements: ['Academic Excellence Award', 'Coding Competition Winner', 'Student Council President'],
    status: 'active',
    lastActive: '2 hours ago',
    rating: 4.8,
    bio: 'High-achieving student with a strong interest in STEM fields. Demonstrates exceptional leadership skills.',
    location: 'Building C, Floor 3',
    joinDate: '2019-09-01'
  },
  {
    id: 's4',
    name: 'Ethan Davis',
    type: 'student',
    email: 'ethan.davis@school.com',
    class: '8A',
    grade: 'Grade 8',
    subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
    achievements: ['Most Improved Student', 'Reading Challenge Winner'],
    status: 'active',
    lastActive: '1 day ago',
    rating: 4.2,
    bio: 'Dedicated student who has shown remarkable improvement this year. Enthusiastic about learning and growth.',
    location: 'Building A, Floor 1',
    joinDate: '2022-09-01'
  },
  {
    id: 's5',
    name: 'Isabella "Bella" Garcia',
    type: 'student',
    email: 'isabella.garcia@school.com',
    class: '12A',
    grade: 'Grade 12',
    subjects: ['Advanced Literature', 'Creative Writing', 'Psychology', 'Spanish'],
    achievements: ['Creative Writing Award', 'Community Service Leader', 'Valedictorian Candidate'],
    status: 'active',
    lastActive: '45 minutes ago',
    rating: 4.9,
    bio: 'Creative and compassionate senior with a talent for writing and community service. Natural mentor to younger students.',
    location: 'Building A, Floor 4',
    joinDate: '2018-09-01'
  }
];

export default function IndividualSearchSection({ subdomain, onBack, onSelect }: IndividualSearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teacher' | 'student'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'on_leave'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'lastActive' | 'joinDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIndividuals, setSelectedIndividuals] = useState<Individual[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const departments = Array.from(new Set(mockIndividuals.filter(i => i.type === 'teacher').map(i => i.department)));
  const grades = Array.from(new Set(mockIndividuals.filter(i => i.type === 'student').map(i => i.grade)));

  const filteredIndividuals = mockIndividuals.filter(individual => {
    const matchesSearch = individual.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        individual.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        individual.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        individual.achievements?.some(achievement => achievement.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || individual.type === filterType;
    const matchesStatus = filterStatus === 'all' || individual.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || individual.department === filterDepartment;
    const matchesGrade = filterGrade === 'all' || individual.grade === filterGrade;
    
    return matchesSearch && matchesType && matchesStatus && matchesDepartment && matchesGrade;
  });

  const sortedIndividuals = [...filteredIndividuals].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'lastActive':
        aValue = a.lastActive || '';
        bValue = b.lastActive || '';
        break;
      case 'joinDate':
        aValue = a.joinDate || '';
        bValue = b.joinDate || '';
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleIndividualSelect = (individual: Individual) => {
    if (onSelect) {
      onSelect(individual);
    } else {
      setSelectedIndividuals(prev => {
        const isSelected = prev.some(i => i.id === individual.id);
        if (isSelected) {
          return prev.filter(i => i.id !== individual.id);
        } else {
          return [...prev, { ...individual, isSelected: true }];
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      case 'on_leave': return <Clock className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const renderIndividualCard = (individual: Individual) => (
    <div
      key={individual.id}
      onClick={() => handleIndividualSelect(individual)}
      className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        selectedIndividuals.some(i => i.id === individual.id)
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-white/80'
      }`}
    >
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(individual.status)}`}>
        {getStatusIcon(individual.status)}
        {individual.status.replace('_', ' ')}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
          individual.type === 'teacher' 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-green-500 to-green-600'
        }`}>
          {individual.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground">{individual.name}</h3>
            {individual.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-foreground">{individual.rating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {individual.type === 'teacher' ? (
              <>
                <GraduationCap className="w-4 h-4" />
                <span>{individual.department}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>{individual.grade} • {individual.class}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>{individual.email}</span>
        </div>
        {individual.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{individual.phone}</span>
          </div>
        )}
        {individual.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{individual.location}</span>
          </div>
        )}
      </div>

      {/* Subjects/Skills */}
      {individual.subjects && individual.subjects.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            {individual.type === 'teacher' ? 'Subjects' : 'Current Subjects'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {individual.subjects.slice(0, 3).map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                {subject}
              </span>
            ))}
            {individual.subjects.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                +{individual.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Achievements */}
      {individual.achievements && individual.achievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
            <Award className="w-4 h-4" />
            Achievements
          </h4>
          <div className="space-y-1">
            {individual.achievements.slice(0, 2).map((achievement, index) => (
              <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                {achievement}
              </div>
            ))}
            {individual.achievements.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{individual.achievements.length - 2} more achievements
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bio */}
      {individual.bio && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{individual.bio}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
        <div className="text-xs text-muted-foreground">
          Last active: {individual.lastActive || 'Unknown'}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <MessageSquare className="w-4 h-4 text-primary" />
          </button>
          <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Eye className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Selection Indicator */}
      {selectedIndividuals.some(i => i.id === individual.id) && (
        <div className="absolute top-4 left-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Return to Main Menu Button */}
      <div className="flex justify-end">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-primary/90 text-white font-semibold rounded-lg hover:bg-primary transition-all duration-300 shadow-lg"
        >
          <Home className="w-4 h-4" />
          Return to Main Menu
        </button>
      </div>

      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Search Individuals</h2>
        <p className="text-muted-foreground">Find teachers, students, and other members of the school community</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, email, subjects, or achievements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-primary/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Basic Filters */}
        <div className="flex flex-wrap gap-3">
          {(['all', 'teacher', 'student'] as const).map(type => (
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

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white/50 text-muted-foreground'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-white/50 text-muted-foreground'
              }`}
            >
              <div className="w-4 h-4 space-y-1">
                <div className="h-1 bg-current rounded-sm"></div>
                <div className="h-1 bg-current rounded-sm"></div>
                <div className="h-1 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/30 rounded-xl border border-primary/20">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="lastActive">Last Active</option>
                <option value="joinDate">Join Date</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Found {sortedIndividuals.length} individual{sortedIndividuals.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Results Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIndividuals.map(renderIndividualCard)}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedIndividuals.map(renderIndividualCard)}
          </div>
        )}

        {sortedIndividuals.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Selected Individuals Summary */}
      {selectedIndividuals.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Selected ({selectedIndividuals.length})</span>
            <button
              onClick={() => setSelectedIndividuals([])}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIndividuals.map(individual => (
              <div
                key={individual.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/20 text-sm"
              >
                <span>{individual.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndividuals(prev => prev.filter(i => i.id !== individual.id));
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
        {selectedIndividuals.length > 0 && (
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Continue with {selectedIndividuals.length} selected
          </button>
        )}
      </div>
    </div>
  );
} 