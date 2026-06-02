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
  UserCircle,
  Wallet,
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
import { useStudentFeeOverview } from '@/lib/student/useStudentFees';
import { StudentFeeSummaryCard } from './StudentFeeSummaryCard';
import { useChatUnreadTotal } from '@/lib/chat/ChatProvider';
import { cn } from '@/lib/utils';
import {
  formatStudentClassLabel,
  getStudentDisplayName,
} from '@/lib/student/studentDisplay';
import {
  StatCellSkeleton,
  StudentDashboardMobileSkeleton,
  StudentProfileBannerSkeleton,
  StudentQuickActionsSkeleton,
  StudentStatsGridSkeleton,
  StudentWelcomeSkeleton,
} from './StudentDashboardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const MOBILE_ACTION_LABELS: Record<string, string> = {
  'submit-assignment': 'Assign',
  'view-timetable': 'Schedule',
  'check-exam-results': 'Results',
  'download-notes': 'Notes',
  'read-school-message': 'Messages',
  'view-attendance': 'Attend',
  'track-performance': 'Perf',
  'view-upcoming-tests': 'Tests',
  'contact-class-teacher': 'Contact',
  'download-report-card': 'Reports',
  'view-my-fees': 'Fees',
};

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
  const { student, loading: studentLoading } = useCurrentStudent();
  const { summary: attendanceSummary, loading: attendanceLoading } =
    useStudentAttendanceSummary(subdomain);
  const { sessions: examSessions, loading: examLoading } =
    useStudentExamResults(subdomain);
  const { pendingCount, upcomingCount, loading: testsLoading } =
    useStudentTests(subdomain);
  const { nextLesson, loading: nextClassLoading } = useStudentNextClass();
  const { overview: feeOverview, loading: feesLoading, refetch: refetchFees } =
    useStudentFeeOverview(subdomain);
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

  useEffect(() => {
    if (student?.name) {
      setStudentName(student.name);
    }
  }, [student?.name]);

  const displayName = getStudentDisplayName(student, studentName);
  const classLabel = formatStudentClassLabel(student);
  const dashboardLoading = studentLoading;

  const handleActionClick = (actionId: string) => {
    console.log(`Action ${actionId} clicked`);
    
    // Handle navigation for different actions
    switch (actionId) {
      case 'submit-assignment':
        setCurrentView('assignments');
        break;
      case 'view-timetable':
        router.push('/student/timetable');
        break;
      case 'check-exam-results':
        setCurrentView('examResults');
        break;
      case 'download-notes':
        setCurrentView('downloadNotes');
        break;
      case 'read-school-message':
        router.push('/student/messages');
        break;
      case 'view-attendance':
        setCurrentView('attendance');
        break;
      case 'view-my-fees':
        router.push('/student/fees');
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
      id: 'view-my-fees',
      title: 'My Fees',
      icon: <Wallet className="w-6 h-6" />,
      onClick: () => handleActionClick('view-my-fees'),
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

  const renderQuickActions = (mobile = false) => (
    <div className={mobile ? 'mb-1' : 'mb-2'}>
      {!mobile && (
        <div className="mb-8 flex items-center justify-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
        </div>
      )}
      {mobile && (
        <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Quick actions
        </p>
      )}
      <div className={mobile ? '' : 'flex justify-center'}>
        <div className={cn(
          'w-full',
          mobile
            ? 'grid grid-cols-4 gap-1.5'
            : 'mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        )}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={cn(
                'group flex cursor-pointer flex-col items-center justify-center select-none border border-primary/20 bg-card text-center transition-all duration-150 hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary active:scale-95',
                mobile
                  ? 'rounded-lg bg-white px-1 py-2 shadow-sm dark:bg-slate-900'
                  : 'h-32 w-32 rounded-none shadow-sm hover:shadow-md',
              )}
            >
              <span className={cn(
                'flex items-center justify-center text-white transition-all duration-200',
                action.bgClass,
                mobile
                  ? 'mb-1 h-8 w-8 rounded-md'
                  : 'mb-2 h-12 w-12 rounded shadow-md group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary/20',
              )}>
                {React.cloneElement(action.icon as React.ReactElement<{ className?: string }>, {
                  className: mobile ? 'h-4 w-4' : 'w-6 h-6',
                })}
              </span>
              <span className={cn(
                'font-semibold leading-tight text-foreground',
                mobile ? 'text-[9px] line-clamp-2' : 'text-xs',
              )}>
                {mobile ? MOBILE_ACTION_LABELS[action.id] ?? action.title : action.title}
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
      classLabel,
    };
  }, [
    attendanceSummary,
    chatUnread,
    examSessions,
    nextLesson,
    pendingCount,
    upcomingCount,
    student,
  ]);

  const renderStudentStats = (mobile = false) => {
    const statsLoading = {
      next: nextClassLoading,
      assign: testsLoading,
      tests: testsLoading,
      msgs: false,
      attend: attendanceLoading,
      avg: examLoading,
    };

    if (mobile) {
      const cells = [
        {
          key: 'next',
          icon: Calendar,
          label: 'Next class',
          value: studentStats.nextClass.subject,
          sub: studentStats.nextClass.countdown,
          meta: studentStats.nextClass.time,
          wide: true,
          loading: statsLoading.next,
        },
        {
          key: 'assign',
          icon: BookOpen,
          label: 'Pending',
          value: String(studentStats.pendingAssignments),
          loading: statsLoading.assign,
        },
        {
          key: 'tests',
          icon: ClipboardList,
          label: 'Tests',
          value: String(studentStats.upcomingTests),
          loading: statsLoading.tests,
        },
        {
          key: 'msgs',
          icon: Inbox,
          label: 'Unread',
          value: String(studentStats.unreadMessages),
          loading: statsLoading.msgs,
        },
        {
          key: 'attend',
          icon: UserCheck,
          label: 'Attend',
          value: studentStats.attendanceRate,
          loading: statsLoading.attend,
        },
        {
          key: 'avg',
          icon: BarChart3,
          label: 'Average',
          value: studentStats.averageScore,
          loading: statsLoading.avg,
        },
      ];

      return (
        <div className="grid grid-cols-3 gap-1.5">
          {cells.map((cell) => {
            if (cell.loading) {
              return <StatCellSkeleton key={cell.key} wide={cell.wide} />;
            }

            const Icon = cell.icon;
            return (
              <div
                key={cell.key}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white px-1 py-2 text-center dark:border-slate-700 dark:bg-slate-900',
                  cell.wide && 'col-span-3 flex-row items-center gap-2 px-2.5 py-2 text-left',
                )}
              >
                <Icon className={cn('shrink-0 text-primary', cell.wide ? 'h-4 w-4' : 'mb-0.5 h-3.5 w-3.5')} />
                <div className={cn('min-w-0', cell.wide && 'flex-1')}>
                  {cell.wide ? (
                    <>
                      <p className="truncate text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                        {cell.value}
                      </p>
                      <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {'meta' in cell ? cell.meta : ''}
                        {cell.sub ? ` · ${cell.sub}` : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">
                        {cell.value}
                      </p>
                      <p className="mt-0.5 text-[9px] leading-tight text-slate-500 dark:text-slate-400">
                        {cell.label}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (studentLoading) {
      return (
        <>
          <StudentProfileBannerSkeleton />
          <StudentStatsGridSkeleton mobile={false} />
        </>
      );
    }

    return (
    <>
      {displayName ? (
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-3xl rounded-lg border border-primary/20 bg-gradient-to-r from-primary/20 via-background to-primary/20 px-6 py-4 shadow-md">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <UserCircle className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-md font-medium text-muted-foreground">Welcome,</span>
                    <span className="ml-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold text-transparent">
                      {displayName}
                    </span>
                  </div>
                  {studentStats.classLabel !== '—' && (
                    <div className="mt-1 flex items-center">
                      <GraduationCap className="mr-1 h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Class:{' '}
                        <span className="font-semibold text-foreground">
                          {studentStats.classLabel}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center border-r border-primary/20 pr-5">
                  <span className="text-xs text-muted-foreground">Attendance</span>
                  <div className="flex items-center">
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent">{studentStats.attendanceRate}</span>
                    <UserCheck className="ml-1 h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Average Score</span>
                  <div className="flex items-center">
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent">{studentStats.averageScore}</span>
                    <BarChart3 className="ml-1 h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto mb-8 grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {/* Next Class */}
      {nextClassLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Skeleton className="mb-2 h-5 w-5 rounded-full" />
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      ) : (
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Next Class</span>
        </div>
        <div className="text-sm font-bold text-foreground text-center">{studentStats.nextClass.subject}</div>
        <div className="text-xs text-muted-foreground">{studentStats.nextClass.time} <span className="text-primary">({studentStats.nextClass.countdown})</span></div>
      </div>
      )}
      {/* Pending Assignments */}
      {testsLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Skeleton className="mb-2 h-5 w-5 rounded-full" />
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-6 w-8" />
        </div>
      ) : (
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <BookOpen className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Pending Assignments</span>
        <span className="text-xl font-bold text-foreground">{studentStats.pendingAssignments}</span>
      </div>
      )}
      {/* Upcoming Tests */}
      {testsLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Skeleton className="mb-2 h-5 w-5 rounded-full" />
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-6 w-8" />
        </div>
      ) : (
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <ClipboardList className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Upcoming Tests</span>
        <span className="text-xl font-bold text-foreground">{studentStats.upcomingTests}</span>
      </div>
      )}
      {/* Unread Messages */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Inbox className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Unread Messages</span>
        <span className="text-xl font-bold text-foreground">{studentStats.unreadMessages}</span>
      </div>
      {/* Attendance Rate */}
      {attendanceLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Skeleton className="mb-2 h-5 w-5 rounded-full" />
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-6 w-10" />
        </div>
      ) : (
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <UserCheck className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Attendance Rate</span>
        <span className="text-xl font-bold text-foreground">{studentStats.attendanceRate}</span>
      </div>
      )}
      {/* Average Score */}
      {examLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Skeleton className="mb-2 h-5 w-5 rounded-full" />
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-6 w-10" />
        </div>
      ) : (
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <BarChart3 className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Average Score</span>
        <span className="text-xl font-bold text-foreground">{studentStats.averageScore}</span>
      </div>
      )}
    </div>
    </>
    );
  };

  return (
    <div className="min-h-0 bg-[#f2f2f7] lg:min-h-screen lg:bg-gradient-to-br lg:from-background lg:via-white lg:to-primary/5">
      {/* Desktop header */}
      <div className="hidden bg-gradient-to-r from-card/95 via-white/90 to-primary/10 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-primary/20 lg:sticky lg:top-0 lg:z-50 lg:shadow-sm">
        <div className="px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <GraduationCap className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div className="space-y-1">
                {studentLoading ? (
                  <>
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-40" />
                  </>
                ) : displayName ? (
                  <>
                    <h1 className="text-2xl font-bold lg:text-3xl">
                      <span className="flex items-center gap-2">
                        <span className="text-foreground">Welcome,</span>
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-bold text-transparent">{displayName}</span>
                      </span>
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground/90">
                      {studentStats.classLabel !== '—'
                        ? studentStats.classLabel
                        : 'Stay organized with your studies today'}
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
      <div className="px-2 py-2 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="hidden w-full justify-center py-6 lg:flex">
            <DynamicLogo subdomain={subdomain} size="lg" showText={true} />
          </div>
          {currentView === 'dashboard' ? (
            <>
              {dashboardLoading ? (
                <>
                  <StudentDashboardMobileSkeleton />
                  <div className="hidden lg:block space-y-8">
                    <Skeleton className="h-24 w-full rounded-md" />
                    <StudentProfileBannerSkeleton />
                    <StudentStatsGridSkeleton mobile={false} />
                    <StudentQuickActionsSkeleton />
                  </div>
                </>
              ) : (
                <>
              {/* Mobile — compact app home */}
              <div className="space-y-2 lg:hidden">
                {displayName || studentLoading ? (
                  studentLoading ? (
                    <StudentWelcomeSkeleton />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <UserCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {displayName}
                        </p>
                        {studentStats.classLabel !== '—' ? (
                          <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                            {studentStats.classLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )
                ) : null}
                <StudentFeeSummaryCard
                  overview={feeOverview}
                  loading={feesLoading}
                  onRefresh={refetchFees}
                  compact
                />
                <StudentLiveLessonStatus compact />
                {renderStudentStats(true)}
                {renderQuickActions(true)}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block">
                <div className="mb-8">
                  <StudentLiveLessonStatus />
                </div>
                {renderStudentStats()}
                <div className="mx-auto mb-8 max-w-5xl">
                  <StudentFeeSummaryCard
                    overview={feeOverview}
                    loading={feesLoading}
                    onRefresh={refetchFees}
                  />
                </div>
                {renderQuickActions()}
              </div>
                </>
              )}
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