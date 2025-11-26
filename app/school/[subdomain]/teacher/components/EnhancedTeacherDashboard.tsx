"use client"

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Plus,
  Eye,
  CheckSquare,
  ClipboardList,
  Send,
  Inbox,
  Upload,
  Award,
  TrendingUp,
  Search,
  RefreshCw
} from "lucide-react";
import CreateTestSection from "./CreateTestSection";
import MarkRegisterSection from "./MarkRegisterSection";
import SendMessageSection from "./SendMessageSection";
import IndividualSearchSection from "./IndividualSearchSection";
import ShareResourcesSection from "./ShareResourcesSection";
import AssignHomeworkSection from "./AssignHomeworkSection";
import EnterMarksSection from "./EnterMarksSection";
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
  const [showMarkRegister, setShowMarkRegister] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showIndividualSearch, setShowIndividualSearch] = useState(false);
  const [showShareResources, setShowShareResources] = useState(false);
  const [showAssignHomework, setShowAssignHomework] = useState(false);
  const [showEnterMarks, setShowEnterMarks] = useState(false);
  const [newlyCreatedTest, setNewlyCreatedTest] = useState<{
    title: string;
    subject: string;
    grade: string;
    date: string;
    startTime: string;
    duration: string;
  } | undefined>(undefined);
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Teacher information from cookies
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherEmail, setTeacherEmail] = useState<string>('');
  const [teacherRole, setTeacherRole] = useState<string>('');

  // Set current date only on client side to avoid hydration issues
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }));
  }, []);

  // Fetch teacher information from cookies when component mounts
  useEffect(() => {
    // Check if window is defined (we're in the browser)
    if (typeof window !== 'undefined') {
      try {
        // Function to get cookie value by name
        const getCookie = (name: string): string | null => {
          const cookieValue = `; ${document.cookie}`;
          const parts = cookieValue.split(`; ${name}=`);
          if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
          }
          return null;
        };
        
        const userNameFromCookie = getCookie('userName');
        const userEmailFromCookie = getCookie('email');
        const userRoleFromCookie = getCookie('userRole');
        
        if (userNameFromCookie) {
          setTeacherName(decodeURIComponent(userNameFromCookie));
        }
        if (userEmailFromCookie) {
          setTeacherEmail(decodeURIComponent(userEmailFromCookie));
        }
        if (userRoleFromCookie) {
          setTeacherRole(decodeURIComponent(userRoleFromCookie));
        }
      } catch (error) {
        console.error('Error fetching teacher information from cookies:', error);
      }
    }
  }, []);

  const handleActionClick = (actionId: string, menuId: string) => {
    console.log(`Action ${actionId} clicked for menu ${menuId}`);
    // Here you would implement the actual functionality
    // For now, we'll just log the action
  };

  // Helper function to get initials from teacher name
  const getInitials = (name: string) => {
    if (!name) return 'T';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      onClick: () => setShowMarkRegister(true),
      bgClass: 'bg-primary',
    },
    {
      id: 'send-message',
      title: 'Send Message',
      icon: <Send className="w-6 h-6" />,
      onClick: () => setShowSendMessage(true),
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
      onClick: () => setShowEnterMarks(true),
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
      onClick: () => setShowAssignHomework(true),
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
      id: 'search-individuals',
      title: 'Search Individuals',
      icon: <Search className="w-6 h-6" />,
      onClick: () => setShowIndividualSearch(true),
      bgClass: 'bg-primary',
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
      onClick: () => setShowShareResources(true),
      bgClass: 'bg-primary/80',
    },
  ];

  const renderQuickActions = () => (
    <div className="mb-6">
     
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 aspect-square bg-card border border-primary/20 shadow-sm hover:shadow-md transition-all duration-150 hover:bg-primary/5 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary active:scale-95 rounded-lg"
          >
            <span className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mb-2 ${action.bgClass} text-white shadow-md rounded-lg transition-all duration-200 group-hover:scale-110`}>
              {action.icon}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground text-center leading-tight">
              {action.title}
            </span>
          </button>
        ))}
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
    <div className="mb-6">
      <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 px-1">
        Stats Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Next Lesson */}
        <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-2.5 sm:p-3 shadow-sm rounded-lg">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
          <span className="text-[10px] sm:text-xs font-semibold text-foreground">Next Lesson</span>
          <div className="text-[11px] sm:text-sm font-bold text-foreground text-center mt-0.5">{teacherStats.nextLesson.subject}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground">{teacherStats.nextLesson.time}</div>
        </div>
        {/* Active Assignments */}
        <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-2.5 sm:p-3 shadow-sm rounded-lg">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
          <span className="text-[10px] sm:text-xs font-semibold text-foreground">Assignments</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{teacherStats.activeAssignments}</span>
        </div>
        {/* Pending Tasks */}
        <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-2.5 sm:p-3 shadow-sm rounded-lg">
          <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
          <span className="text-[10px] sm:text-xs font-semibold text-foreground">Tasks</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{teacherStats.pendingTasks}</span>
        </div>
        {/* Unread Messages */}
        <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-2.5 sm:p-3 shadow-sm rounded-lg">
          <Inbox className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
          <span className="text-[10px] sm:text-xs font-semibold text-foreground">Messages</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{teacherStats.unreadMessages}</span>
        </div>
        {/* Students Present Today */}
        <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-2.5 sm:p-3 shadow-sm rounded-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
          <span className="text-[10px] sm:text-xs font-semibold text-foreground">Present</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{teacherStats.studentsPresent}/{teacherStats.studentsTotal}</span>
        </div>
        {/* Upcoming Duty */}
        <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-2.5 sm:p-3 shadow-sm rounded-lg">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
          <span className="text-[10px] sm:text-xs font-semibold text-foreground">Duty</span>
          <span className="text-[10px] sm:text-sm font-bold text-foreground text-center">{teacherStats.onDuty ? 'This Week' : 'None'}</span>
        </div>
      </div>
    </div>
  );

  // Replace renderDashboardOverview with renderTeacherStats


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Compact Mobile-First Header */}
      <div className="bg-card/95 border-b border-primary/20 sticky top-0 z-50 shadow-sm">
        <div className="px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Teacher Name */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <DynamicLogo subdomain={subdomain} size="sm" showText={false} />
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                {teacherName || 'Teacher Dashboard'}
              </h1>
            </div>
            
            {/* Next Lesson + Refresh Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-white/50 rounded-full border border-primary/10 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-xs font-semibold text-foreground truncate">
                    {teacherStats.nextLesson.subject}
                  </span>
                  <span className="text-[9px] sm:text-xs text-muted-foreground truncate">
                    {teacherStats.nextLesson.time}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/50 hover:bg-white/80 rounded-full border border-primary/10 hover:border-primary/30 transition-all duration-200 hover:scale-105 active:scale-95"
                title="Refresh page"
                aria-label="Refresh page"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {showCreateTest ? (
            <CreateTestSection 
              subdomain={subdomain} 
              onBack={() => setShowCreateTest(false)}
              onAssignHomework={(testData) => {
                setNewlyCreatedTest(testData);
                setShowCreateTest(false);
                setShowAssignHomework(true);
              }}
            />
          ) : showMarkRegister ? (
            <MarkRegisterSection subdomain={subdomain} onBack={() => setShowMarkRegister(false)} />
          ) : showSendMessage ? (
            <SendMessageSection subdomain={subdomain} onBack={() => setShowSendMessage(false)} />
          ) : showIndividualSearch ? (
            <IndividualSearchSection subdomain={subdomain} onBack={() => setShowIndividualSearch(false)} />
          ) : showShareResources ? (
            <ShareResourcesSection subdomain={subdomain} onBack={() => setShowShareResources(false)} />
          ) : showAssignHomework ? (
            <AssignHomeworkSection 
              subdomain={subdomain} 
              onBack={() => {
                setShowAssignHomework(false);
                setNewlyCreatedTest(undefined);
              }}
              onCreateTest={() => setShowCreateTest(true)}
              newlyCreatedTest={newlyCreatedTest}
            />
          ) : showEnterMarks ? (
            <EnterMarksSection 
              subdomain={subdomain} 
              onBack={() => setShowEnterMarks(false)}
            />
          ) : (
            <>
              {renderQuickActions()}
              {renderTeacherStats()}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 