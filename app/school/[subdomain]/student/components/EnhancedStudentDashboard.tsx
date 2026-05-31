"use client"

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
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
  Copy,
  Search,
  CalendarDays,
  FileDown,
  BookMarked,
  MessageCircle,
  UserCheck,
  BarChart,
  CalendarCheck,
  Phone,
  Printer,
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCircle
} from "lucide-react";
import { DynamicLogo } from '../../parent/components/DynamicLogo';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PendingAssignmentsComponent from './PendingAssignmentsComponent';
import StudentTimetableComponent from './StudentTimetableComponent';
import StudentExamResultsComponent from './StudentExamResultsComponent';
import DownloadNotesComponent from './DownloadNotesComponent';
import { StudentMessagesSection } from './StudentMessagesSection';
import { StudentAttendanceSection } from './StudentAttendanceSection';
import { StudentLiveLessonStatus } from './StudentLiveLessonStatus';
import { StudentContactTeacherSection } from './StudentContactTeacherSection';
import { useStudentExamLiveUpdates } from '@/lib/realtime/useStudentExamLiveUpdates';
import { useStudentAssignmentLiveUpdates } from '@/lib/realtime/useStudentAssignmentLiveUpdates';
import { useStudentNotesLiveUpdates } from '@/lib/realtime/useStudentNotesLiveUpdates';
import { useCurrentStudent } from '@/lib/hooks/useCurrentStudent';
import { useStudentAttendanceSummary } from '@/lib/student/useStudentAttendanceSummary';
import { useStudentExamResults } from '@/lib/student/useStudentExamResults';
import { useStudentTests } from '@/lib/student/useStudentTests';
import { useStudentNextClass } from '@/lib/student/useStudentNextClass';
import { useChatUnreadTotal } from '@/lib/chat/ChatProvider';

interface Action {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgClass: string;
}

interface EnhancedStudentDashboardProps {
  subdomain: string;
}

export default function EnhancedStudentDashboard({ subdomain }: EnhancedStudentDashboardProps) {
  useStudentExamLiveUpdates();
  useStudentAssignmentLiveUpdates();
  useStudentNotesLiveUpdates();
  const { student } = useCurrentStudent();
  const { summary: attendanceSummary } = useStudentAttendanceSummary(subdomain);
  const { sessions: examSessions } = useStudentExamResults(subdomain);
  const { pendingCount, upcomingCount } = useStudentTests(subdomain);
  const { nextLesson } = useStudentNextClass();
  const chatUnread = useChatUnreadTotal();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState<'dashboard' | 'assignments' | 'timetable' | 'examResults' | 'downloadNotes' | 'messages' | 'attendance' | 'contactTeacher'>('dashboard');
  const [studentName, setStudentName] = useState<string>('');
  const [preferredTeacherUserId, setPreferredTeacherUserId] = useState<string | null>(null);
  const [preferredTeacherName, setPreferredTeacherName] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch username from cookies when component mounts
  useEffect(() => {
    // Check if window is defined (we're in the browser)
    if (typeof window !== 'undefined') {
      try {
        // Function to get cookie value by name
        const getCookie = (name: string): string | null => {
          const cookieArr = document.cookie.split(';');
          for (let i = 0; i < cookieArr.length; i++) {
            const cookiePair = cookieArr[i].split('=');
            const cookieName = cookiePair[0].trim();
            if (cookieName === name) {
              return decodeURIComponent(cookiePair[1]);
            }
          }
          return null;
        };
        
        const storedName = getCookie('userName');
        if (storedName) {
          setStudentName(storedName);
        }
      } catch (error) {
        console.error('Error fetching userName from cookies:', error);
      }
    }
  }, []);

  const handleActionClick = (actionId: string) => {
    console.log(`Action ${actionId} clicked`);
    
    // Handle navigation for different actions
    switch (actionId) {
      case 'submit-assignment':
        setCurrentView('assignments');
        break;
      case 'view-timetable':
        setCurrentView('timetable');
        break;
      case 'check-exam-results':
        setCurrentView('examResults');
        break;
      case 'download-notes':
        setCurrentView('downloadNotes');
        break;
      case 'read-school-message':
        setCurrentView('messages');
        break;
      case 'view-attendance':
        setCurrentView('attendance');
        break;
      case 'track-performance':
        router.push(`/school/${subdomain}/student/performance`);
        break;
      case 'view-upcoming-tests':
        router.push(`/school/${subdomain}/student/upcoming-tests`);
        break;
      case 'view-exam-timetable':
        router.push(`/school/${subdomain}/student/exam-timetable`);
        break;
      case 'download-report-card':
        router.push(`/school/${subdomain}/student/report-cards`);
        break;
      case 'contact-class-teacher':
        setCurrentView('contactTeacher');
        break;
      default:
        console.log(`Action ${actionId} not implemented yet`);
    }
  };

  const handleBackToDashboard = () => {
    setPreferredTeacherUserId(null);
    setPreferredTeacherName(null);
    setCurrentView('dashboard');
  };

  const handleOpenTeacherMessages = (teacherUserId: string, teacherName: string) => {
    setPreferredTeacherUserId(teacherUserId);
    setPreferredTeacherName(teacherName);
    setCurrentView('messages');
  };

  // Student quick actions with the specified items
  const quickActions: Action[] = [
    {
      id: 'submit-assignment',
      title: 'Submit Assignment',
      icon: <Upload className="w-6 h-6" />,
      onClick: () => handleActionClick('submit-assignment'),
      bgClass: 'bg-primary',
    },
    {
      id: 'view-timetable',
      title: 'View Timetable',
      icon: <Calendar className="w-6 h-6" />,
      onClick: () => handleActionClick('view-timetable'),
      bgClass: 'bg-primary',
    },
    {
      id: 'check-exam-results',
      title: 'Check Exam Results',
      icon: <BarChart3 className="w-6 h-6" />,
      onClick: () => handleActionClick('check-exam-results'),
      bgClass: 'bg-primary',
    },
    {
      id: 'download-notes',
      title: 'Download Notes',
      icon: <Download className="w-6 h-6" />,
      onClick: () => handleActionClick('download-notes'),
      bgClass: 'bg-primary',
    },
    {
      id: 'read-school-message',
      title: 'Read School Message',
      icon: <MessageCircle className="w-6 h-6" />,
      onClick: () => handleActionClick('read-school-message'),
      bgClass: 'bg-primary',
    },
    {
      id: 'view-attendance',
      title: 'View Attendance',
      icon: <UserCheck className="w-6 h-6" />,
      onClick: () => handleActionClick('view-attendance'),
      bgClass: 'bg-primary',
    },
    {
      id: 'track-performance',
      title: 'Track Performance',
      icon: <TrendingUp className="w-6 h-6" />,
      onClick: () => handleActionClick('track-performance'),
      bgClass: 'bg-primary',
    },
    {
      id: 'view-upcoming-tests',
      title: 'View Upcoming Tests',
      icon: <CalendarCheck className="w-6 h-6" />,
      onClick: () => handleActionClick('view-upcoming-tests'),
      bgClass: 'bg-primary',
    },
    {
      id: 'contact-class-teacher',
      title: 'Contact Class Teacher',
      icon: <Phone className="w-6 h-6" />,
      onClick: () => handleActionClick('contact-class-teacher'),
      bgClass: 'bg-primary',
    },
    {
      id: 'download-report-card',
      title: 'Download Report Card',
      icon: <Printer className="w-6 h-6" />,
      onClick: () => handleActionClick('download-report-card'),
      bgClass: 'bg-primary',
    },
  ];

  const renderQuickActions = () => (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl w-full">
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

  // Live stats for dashboard header cards
  const studentStats = useMemo(() => {
    const marks = examSessions.flatMap((s) => s.results);
    const averageScore =
      marks.length > 0
        ? `${Math.round(marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length)}%`
        : '—';

    const nextClass = nextLesson
      ? {
          subject: nextLesson.lesson.subject.name,
          teacher: nextLesson.lesson.teacher.name,
          time: nextLesson.time,
          countdown: nextLesson.startsInFormatted,
        }
      : {
          subject: '—',
          teacher: '—',
          time: '—',
          countdown: 'See timetable',
        };

    return {
      nextClass,
      pendingAssignments: pendingCount,
      upcomingTests: upcomingCount,
      unreadMessages: chatUnread,
      attendanceRate: attendanceSummary
        ? `${Math.round(attendanceSummary.percentage)}%`
        : '—',
      averageScore,
      currentGrade:
        typeof student?.grade === 'string'
          ? student.grade
          : student?.grade?.name ?? '—',
    };
  }, [attendanceSummary, chatUnread, examSessions, nextLesson, pendingCount, upcomingCount, student?.grade]);

  const renderStudentStats = () => (
    <>
      {studentName && (
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-3xl bg-gradient-to-r from-primary/20 via-background to-primary/20 shadow-md border border-primary/20 rounded-lg py-4 px-6 relative">
            {/* Student profile content */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left side - Student info */}
              <div className="flex items-center gap-4">
                {/* Profile avatar */}
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-primary" />
                </div>
                
                {/* Student name */}
                <div>
                  <div className="flex items-baseline">
                    <span className="text-md font-medium text-muted-foreground">Welcome,</span>
                    <span className="text-xl font-bold ml-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {studentName}
                    </span>
                  </div>
                  {studentStats.currentGrade && (
                    <div className="flex items-center mt-1">
                      <GraduationCap className="w-4 h-4 text-primary mr-1" />
                      <span className="text-sm font-medium">Class: <span className="font-semibold text-foreground">{studentStats.currentGrade}</span></span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Stats */}
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center border-r border-primary/20 pr-5">
                  <span className="text-xs text-muted-foreground">Attendance</span>
                  <div className="flex items-center">
                    <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{studentStats.attendanceRate}</span>
                    <UserCheck className="w-4 h-4 text-primary ml-1" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Average Score</span>
                  <div className="flex items-center">
                    <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{studentStats.averageScore}</span>
                    <BarChart3 className="w-4 h-4 text-primary ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 w-full max-w-5xl mx-auto">
      {/* Next Class */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Next Class</span>
        </div>
        <div className="text-sm font-bold text-foreground text-center">{studentStats.nextClass.subject}</div>
        <div className="text-xs text-muted-foreground">{studentStats.nextClass.time} <span className="text-primary">({studentStats.nextClass.countdown})</span></div>
      </div>
      {/* Pending Assignments */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <BookOpen className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Pending Assignments</span>
        <span className="text-xl font-bold text-foreground">{studentStats.pendingAssignments}</span>
      </div>
      {/* Upcoming Tests */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <ClipboardList className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Upcoming Tests</span>
        <span className="text-xl font-bold text-foreground">{studentStats.upcomingTests}</span>
      </div>
      {/* Unread Messages */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Inbox className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Unread Messages</span>
        <span className="text-xl font-bold text-foreground">{studentStats.unreadMessages}</span>
      </div>
      {/* Attendance Rate */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <UserCheck className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Attendance Rate</span>
        <span className="text-xl font-bold text-foreground">{studentStats.attendanceRate}</span>
      </div>
      {/* Average Score */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <BarChart3 className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Average Score</span>
        <span className="text-xl font-bold text-foreground">{studentStats.averageScore}</span>
      </div>
    </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-card/95 via-white/90 to-primary/10 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-primary/20 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <GraduationCap className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div className="space-y-1">
                {studentName ? (
                  <>
                    <h1 className="text-2xl lg:text-3xl font-bold">
                      <span className="flex items-center gap-2">
                        <span className="text-foreground">Welcome,</span>
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">{studentName}</span>
                      </span>
                    </h1>
                    <p className="text-sm text-muted-foreground/90 font-medium">
                      Stay organized with your studies today
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Student Dashboard</h1>
                    <p className="text-sm text-muted-foreground/90 font-medium">Welcome back! Stay organized with your studies.</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-full border border-primary/10 shadow-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">{new Date().toLocaleDateString()}</span>
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
          {currentView === 'dashboard' ? (
            <>
              <div className="mb-8">
                <StudentLiveLessonStatus />
              </div>
              {renderStudentStats()}
              {renderQuickActions()}
            </>
          ) : currentView === 'assignments' ? (
            <PendingAssignmentsComponent subdomain={subdomain} onBack={handleBackToDashboard} />
          ) : currentView === 'timetable' ? (
            <StudentTimetableComponent onBack={handleBackToDashboard} />
          ) : currentView === 'examResults' ? (
            <StudentExamResultsComponent subdomain={subdomain} onBack={handleBackToDashboard} />
          ) : currentView === 'downloadNotes' ? (
            <DownloadNotesComponent subdomain={subdomain} onBack={handleBackToDashboard} />
          ) : currentView === 'messages' ? (
            <StudentMessagesSection
              onBack={handleBackToDashboard}
              preferredParticipantId={preferredTeacherUserId}
              preferredParticipantLabel={preferredTeacherName}
            />
          ) : currentView === 'contactTeacher' ? (
            <StudentContactTeacherSection
              subdomain={subdomain}
              onBack={handleBackToDashboard}
              onOpenMessages={handleOpenTeacherMessages}
            />
          ) : currentView === 'attendance' ? (
            <StudentAttendanceSection subdomain={subdomain} onBack={handleBackToDashboard} />
          ) : null}
        </div>
      </div>
    </div>
  );
} 