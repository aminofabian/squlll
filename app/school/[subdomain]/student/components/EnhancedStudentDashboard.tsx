"use client"

import React, { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  Upload,
  Download,
  MessageCircle,
  UserCheck,
  Wallet,
  TrendingUp,
  CalendarCheck,
  Phone,
  Printer,
  ClipboardList,
  Inbox,
  BarChart3,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  StudentQuickActionsSkeleton,
  StudentStatsGridSkeleton,
} from './StudentDashboardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, Section, StatTile, StatusPill, StudentPage } from '../_ui';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'assignments' | 'timetable' | 'examResults' | 'downloadNotes' | 'messages' | 'attendance' | 'contactTeacher'>('dashboard');
  // Read the cached display name once so the greeting can render before the
  // profile request resolves. Reading a cookie is only possible in the browser,
  // so SSR falls back to an empty string (the loading skeleton is shown then).
  const [studentName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const cookieArr = document.cookie.split(';');
      for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        if (cookiePair[0].trim() === 'userName') {
          return decodeURIComponent(cookiePair[1]);
        }
      }
    } catch (error) {
      console.error('Error fetching userName from cookies:', error);
    }
    return '';
  });
  const [preferredTeacherUserId, setPreferredTeacherUserId] = useState<string | null>(null);
  const [preferredTeacherName, setPreferredTeacherName] = useState<string | null>(null);
  const router = useRouter();

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
      icon: <Upload className="size-[18px]" />,
      onClick: () => handleActionClick('submit-assignment'),
    },
    {
      id: 'view-timetable',
      title: 'View Timetable',
      icon: <Calendar className="size-[18px]" />,
      onClick: () => handleActionClick('view-timetable'),
    },
    {
      id: 'check-exam-results',
      title: 'Check Exam Results',
      icon: <BarChart3 className="size-[18px]" />,
      onClick: () => handleActionClick('check-exam-results'),
    },
    {
      id: 'download-notes',
      title: 'Download Notes',
      icon: <Download className="size-[18px]" />,
      onClick: () => handleActionClick('download-notes'),
    },
    {
      id: 'read-school-message',
      title: 'Read School Message',
      icon: <MessageCircle className="size-[18px]" />,
      onClick: () => handleActionClick('read-school-message'),
    },
    {
      id: 'view-attendance',
      title: 'View Attendance',
      icon: <UserCheck className="size-[18px]" />,
      onClick: () => handleActionClick('view-attendance'),
    },
    {
      id: 'view-my-fees',
      title: 'My Fees',
      icon: <Wallet className="size-[18px]" />,
      onClick: () => handleActionClick('view-my-fees'),
    },
    {
      id: 'track-performance',
      title: 'Track Performance',
      icon: <TrendingUp className="size-[18px]" />,
      onClick: () => handleActionClick('track-performance'),
    },
    {
      id: 'view-upcoming-tests',
      title: 'View Upcoming Tests',
      icon: <CalendarCheck className="size-[18px]" />,
      onClick: () => handleActionClick('view-upcoming-tests'),
    },
    {
      id: 'contact-class-teacher',
      title: 'Contact Class Teacher',
      icon: <Phone className="size-[18px]" />,
      onClick: () => handleActionClick('contact-class-teacher'),
    },
    {
      id: 'download-report-card',
      title: 'Download Report Card',
      icon: <Printer className="size-[18px]" />,
      onClick: () => handleActionClick('download-report-card'),
    },
  ];

  const renderQuickActions = (mobile = false) => {
    const tiles = quickActions.map((action) => (
      <Button
        key={action.id}
        type="button"
        variant="outline"
        onClick={action.onClick}
        className={cn(
          'h-auto border-border bg-card font-normal hover:bg-primary/5',
          mobile
            ? 'w-full flex-col gap-1.5 rounded-lg px-1 py-2.5 text-center'
            : 'w-full justify-start gap-3 rounded-xl px-3 py-3 text-left',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {action.icon}
        </span>
        <span
          className={cn(
            'text-foreground',
            mobile
              ? 'w-full whitespace-normal line-clamp-2 text-[11px] font-medium leading-tight'
              : 'min-w-0 flex-1 truncate text-sm font-medium',
          )}
        >
          {mobile ? MOBILE_ACTION_LABELS[action.id] ?? action.title : action.title}
        </span>
      </Button>
    ));

    if (mobile) {
      return (
        <div>
          <p className="mb-2 px-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick actions
          </p>
          <div className="grid grid-cols-4 gap-2">{tiles}</div>
        </div>
      );
    }

    return (
      <Section
        title="Quick actions"
        description="Jump straight to what you need"
        icon={Sparkles}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{tiles}</div>
      </Section>
    );
  };

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
    classLabel,
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
                  'flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 py-3 text-center',
                  cell.wide && 'col-span-3 flex-row items-center gap-3 px-3 py-3 text-left',
                )}
              >
                <Icon
                  className={cn(
                    'shrink-0 text-primary',
                    cell.wide ? 'h-4 w-4' : 'h-3.5 w-3.5',
                  )}
                />
                <div className={cn('min-w-0', cell.wide && 'flex-1')}>
                  {cell.wide ? (
                    <>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {cell.value}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {'meta' in cell ? cell.meta : ''}
                        {cell.sub ? ` · ${cell.sub}` : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {cell.value}
                      </p>
                      <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
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

    const tiles = [
      {
        key: 'next',
        icon: Calendar,
        label: 'Next class',
        value: studentStats.nextClass.subject,
        hint: `${studentStats.nextClass.time} · ${studentStats.nextClass.countdown}`,
        loading: nextClassLoading,
      },
      {
        key: 'assign',
        icon: BookOpen,
        label: 'Pending',
        value: String(studentStats.pendingAssignments),
        hint: 'Assignments',
        loading: testsLoading,
      },
      {
        key: 'tests',
        icon: ClipboardList,
        label: 'Tests',
        value: String(studentStats.upcomingTests),
        hint: 'Upcoming',
        loading: testsLoading,
      },
      {
        key: 'msgs',
        icon: Inbox,
        label: 'Unread',
        value: String(studentStats.unreadMessages),
        hint: 'Messages',
        loading: false,
      },
      {
        key: 'attend',
        icon: UserCheck,
        label: 'Attendance',
        value: studentStats.attendanceRate,
        hint: 'This term',
        loading: attendanceLoading,
      },
      {
        key: 'avg',
        icon: BarChart3,
        label: 'Average',
        value: studentStats.averageScore,
        hint: 'Exam score',
        loading: examLoading,
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <StatTile
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={
              tile.loading ? (
                <span className="inline-block h-6 w-10 animate-pulse rounded-md bg-muted" />
              ) : (
                tile.value
              )
            }
            hint={tile.loading ? undefined : tile.hint}
          />
        ))}
      </div>
    );
  };

  return (
    <StudentPage wide>
      {currentView === 'dashboard' ? (
        dashboardLoading ? (
          <>
            <StudentDashboardMobileSkeleton />
            <div className="hidden space-y-6 lg:block">
              <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
              <StudentStatsGridSkeleton mobile={false} />
              <StudentQuickActionsSkeleton />
            </div>
          </>
        ) : (
          <>
            {/* Mobile — compact app home */}
            <div className="space-y-3 lg:hidden">
              {displayName ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserCircle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    {studentStats.classLabel !== '—' ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {studentStats.classLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
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
              <PageHeader
                title={displayName ? `Welcome, ${displayName}` : 'Dashboard'}
                subtitle={
                  studentStats.classLabel !== '—'
                    ? studentStats.classLabel
                    : 'Everything you need, in one place'
                }
                actions={
                  <StatusPill tone="neutral" className="gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date().toLocaleDateString()}
                  </StatusPill>
                }
              />
              <div className="space-y-6">
                <StudentLiveLessonStatus />
                {renderStudentStats(false)}
                <StudentFeeSummaryCard
                  overview={feeOverview}
                  loading={feesLoading}
                  onRefresh={refetchFees}
                />
                {renderQuickActions(false)}
              </div>
            </div>
          </>
        )
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
    </StudentPage>
  );
}
