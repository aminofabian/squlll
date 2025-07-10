"use client"

import React, { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  Users, 
  Calendar, 
  MessageSquare, 
  FolderOpen,
  Plus,
  Eye,
  CheckSquare,
  ClipboardList,
  Clock,
  Send,
  Inbox,
  Megaphone,
  Upload,
  Download,
  Settings,
  Home,
  BarChart3,
  Target,
  Award,
  Activity,
  CheckCircle2,
  User,
  TrendingUp,
  Copy
} from "lucide-react";
import CreateTestSection from "./CreateTestSection";
import { DynamicLogo } from '../../parent/components/DynamicLogo';

// Mock data for demonstration
const mockData = {
  assignments: [
    { id: 1, title: "Math Homework", subject: "Mathematics", dueDate: "2024-01-15", submissions: 18, total: 25 },
    { id: 2, title: "Science Project", subject: "Science", dueDate: "2024-01-20", submissions: 22, total: 25 }
  ],
  assessments: [
    { id: 1, title: "Mid-term Exam", subject: "Mathematics", date: "2024-01-18", status: "completed" },
    { id: 2, title: "Science Quiz", subject: "Science", date: "2024-01-22", status: "pending" }
  ],
  attendance: {
    today: { present: 22, absent: 3, total: 25 },
    thisWeek: { present: 108, absent: 12, total: 120 }
  },
  lessonPlans: [
    { id: 1, title: "Algebra Basics", subject: "Mathematics", status: "approved", date: "2024-01-15" },
    { id: 2, title: "Chemical Reactions", subject: "Science", status: "pending", date: "2024-01-16" }
  ],
  messages: [
    { id: 1, from: "Parent - John Smith", subject: "Student Progress", unread: true, time: "2 hours ago" },
    { id: 2, from: "Admin", subject: "Staff Meeting", unread: false, time: "1 day ago" }
  ]
};

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtext: string;
  actions: Action[];
}

interface Action {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgClass: string; // Added bgClass to the interface
}

interface EnhancedTeacherDashboardProps {
  subdomain: string;
}

export default function EnhancedTeacherDashboard({ subdomain }: EnhancedTeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [showCreateTest, setShowCreateTest] = useState(false);

  const handleActionClick = (actionId: string, menuId: string) => {
    console.log(`Action ${actionId} clicked for menu ${menuId}`);
    // Here you would implement the actual functionality
    // For now, we'll just log the action
  };

  // Uniform quick actions with fixed size, centered content, and consistent icon backgrounds
  const quickActions: Action[] = [
    {
      id: 'create-test',
      title: 'Create Test',
      icon: <Plus className="w-6 h-6" />,
      onClick: () => setShowCreateTest(true),
      bgClass: 'bg-primary',
    },
    {
      id: 'mark-register',
      title: 'Mark Register',
      icon: <ClipboardList className="w-6 h-6" />,
      onClick: () => handleActionClick('mark-register', 'quick-actions'),
      bgClass: 'bg-primary',
    },
    {
      id: 'send-message',
      title: 'Send Message',
      icon: <Send className="w-6 h-6" />,
      onClick: () => handleActionClick('send-message', 'quick-actions'),
      bgClass: 'bg-primary',
    },
    {
      id: 'upload-lesson-plan',
      title: 'Upload Lesson Plan',
      icon: <Upload className="w-6 h-6" />,
      onClick: () => handleActionClick('upload-lesson-plan', 'quick-actions'),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'enter-marks',
      title: 'Enter Marks',
      icon: <CheckSquare className="w-6 h-6" />,
      onClick: () => handleActionClick('enter-marks', 'quick-actions'),
      bgClass: 'bg-primary',
    },
    {
      id: 'view-timetable',
      title: 'View Timetable',
      icon: <Calendar className="w-6 h-6" />,
      onClick: () => handleActionClick('view-timetable', 'quick-actions'),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'assign-homework',
      title: 'Assign Homework',
      icon: <BookOpen className="w-6 h-6" />,
      onClick: () => handleActionClick('assign-homework', 'quick-actions'),
      bgClass: 'bg-primary',
    },
    {
      id: 'review-submissions',
      title: 'Review Submissions',
      icon: <Eye className="w-6 h-6" />,
      onClick: () => handleActionClick('review-submissions', 'quick-actions'),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'track-student-progress',
      title: 'Track Student Progress',
      icon: <TrendingUp className="w-6 h-6" />,
      onClick: () => handleActionClick('track-student-progress', 'quick-actions'),
      bgClass: 'bg-primary',
    },
    {
      id: 'share-resources',
      title: 'Share Resources',
      icon: <Upload className="w-6 h-6" />,
      onClick: () => handleActionClick('share-resources', 'quick-actions'),
      bgClass: 'bg-primary/80',
    },
  ];

  const renderQuickActions = () => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-3xl w-full">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group flex flex-col items-center justify-center w-32 h-32 bg-card border border-primary/20 shadow-sm hover:shadow-md transition-all duration-150 hover:bg-primary/5 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary active:scale-95 select-none rounded-none cursor-pointer"
            >
              <span className={`flex items-center justify-center w-12 h-12 mb-2 ${action.bgClass} text-white shadow-md rounded transition-all duration-200 cursor-pointer group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary/20`}>
                {action.icon}
              </span>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">
                {action.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Mock data for new teacher stats
  const teacherStats = {
    nextLesson: {
      subject: 'Mathematics',
      class: 'Grade 7',
      time: '10:30 AM',
      countdown: 'in 18 min',
    },
    activeAssignments: 2,
    pendingTasks: 4,
    unreadMessages: 1,
    studentsPresent: 22,
    studentsTotal: 25,
    onDuty: true,
    dutyText: 'On Duty: This Week',
  };

  const renderTeacherStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 w-full max-w-5xl mx-auto">
      {/* Next Lesson */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Next Lesson</span>
        </div>
        <div className="text-sm font-bold text-foreground text-center">{teacherStats.nextLesson.subject} – {teacherStats.nextLesson.class}</div>
        <div className="text-xs text-muted-foreground">{teacherStats.nextLesson.time} <span className="text-primary">({teacherStats.nextLesson.countdown})</span></div>
      </div>
      {/* Active Assignments */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <BookOpen className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Active Assignments</span>
        <span className="text-xl font-bold text-foreground">{teacherStats.activeAssignments}</span>
      </div>
      {/* Pending Tasks */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <ClipboardList className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Pending Tasks</span>
        <span className="text-xl font-bold text-foreground">{teacherStats.pendingTasks}</span>
      </div>
      {/* Unread Messages */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Inbox className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Unread Messages</span>
        <span className="text-xl font-bold text-foreground">{teacherStats.unreadMessages}</span>
      </div>
      {/* Students Present Today */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Users className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Students Today</span>
        <span className="text-xl font-bold text-foreground">{teacherStats.studentsPresent}/{teacherStats.studentsTotal}</span>
      </div>
      {/* Upcoming Duty */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Award className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Upcoming Duty</span>
        <span className="text-sm font-bold text-foreground">{teacherStats.onDuty ? teacherStats.dutyText : 'No Duty Today'}</span>
      </div>
    </div>
  );

  // Replace renderDashboardOverview with renderTeacherStats


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4 lg:px-8 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back! Manage your classes efficiently.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full flex justify-center py-6">
            <DynamicLogo subdomain={subdomain} size="lg" showText={true} />
          </div>
          {showCreateTest ? (
            <CreateTestSection subdomain={subdomain} onBack={() => setShowCreateTest(false)} />
          ) : (
            <>
              {renderTeacherStats()}
              {renderQuickActions()}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 