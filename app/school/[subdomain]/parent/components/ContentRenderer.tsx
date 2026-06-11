'use client'

import React from 'react';
import { ParentFeesSection } from './ParentFeesSection';
import { ParentAttendanceSection } from './ParentAttendanceSection';
import { ParentGradesSection } from './ParentGradesSection';
import { ParentNotesSection } from './ParentNotesSection';
import { ParentReportCardSection } from './ParentReportCardSection';
import { ParentScheduleSection } from './ParentScheduleSection';
import { ParentMessagesSection } from './ParentMessagesSection';
import type { ParentPortalChild } from '@/lib/parent/types';
import type { ParentConsolidatedFees } from '@/lib/parent/parentFees';

interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  status: string;
}

interface Grade {
  subject: string;
  assignment: string;
  grade: string;
  points: string;
  date: string;
}

interface Notification {
  id: string | number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface Child {
  id: number;
  studentId?: string;
  name: string;
  grade: string;
  class: string;
  avatar: string;
  attendance: number;
  currentGPA: number;
  behavior: string;
}

interface ContentRendererProps {
  activeTab: string;
  subdomain: string;
  todaySchedule: ScheduleItem[];
  notifications: Notification[];
  children?: Child[];
  selectedChild?: number;
  setSelectedChild?: (index: number) => void;
  portalError?: string | null;
  consolidatedFees?: ParentConsolidatedFees | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-primary bg-primary/10 border border-primary/20';
    case 'in-progress': return 'text-primary bg-primary/10 border border-primary/20';
    case 'upcoming': return 'text-primary bg-primary/10 border border-primary/20';
    default: return 'text-slate-600 bg-slate-50 border border-slate-200';
  }
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-green-700 bg-green-100 border border-green-300';
  if (grade.startsWith('B')) return 'text-blue-700 bg-blue-100 border border-blue-300';
  if (grade.startsWith('C')) return 'text-amber-700 bg-amber-100 border border-amber-300';
  if (grade.startsWith('D')) return 'text-orange-700 bg-orange-100 border border-orange-300';
  return 'text-red-700 bg-red-100 border border-red-300';
};

export const ContentRenderer = ({ 
  activeTab,
  subdomain,
  todaySchedule, 
  notifications,
  children,
  selectedChild = 0,
  setSelectedChild,
  portalError = null,
  consolidatedFees = null,
}: ContentRendererProps) => {
  const renderNotifications = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl">
        <div className="p-4 md:p-6 border-b-2 border-primary/20">
          <h2 className="text-lg md:text-xl font-black text-primary">Notifications</h2>
        </div>
        <div className="p-4 md:p-6 space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-3 md:p-4 rounded-xl border-2 ${notification.read ? 'bg-slate-50 border-slate-200' : 'bg-primary/10 border-primary/20'}`}>
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.read ? 'bg-slate-400' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 leading-relaxed">{notification.message}</p>
                  <p className="text-xs text-slate-600 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 md:p-6 shadow-xl">
      <h2 className="text-lg md:text-xl font-black mb-4 md:mb-6 text-primary">Full Schedule</h2>
      <div className="space-y-3 md:space-y-4">
        {todaySchedule.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 md:p-4 border-2 border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
            <div className="text-sm font-black text-primary w-full sm:w-20">{item.time}</div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-slate-800 text-sm md:text-base">{item.subject}</div>
              <div className="text-xs md:text-sm text-slate-600">{item.teacher} • {item.room}</div>
            </div>
            <span className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs font-black self-start sm:self-auto ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGrades = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-black mb-2">Academic Performance</h1>
          <p className="text-white/90 font-medium text-sm md:text-base">Link your child to view grades and progress</p>
        </div>
      </div>
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <h2 className="text-lg font-black text-primary mb-2">No Child Linked</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Please link your child&apos;s account to view their academic performance, grades, and report cards.
        </p>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-black mb-2">Academic Reports</h1>
          <p className="text-white/90 font-medium text-sm md:text-base">Link your child to view report cards</p>
        </div>
      </div>
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-lg font-black text-primary mb-2">No Child Linked</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Please link your child&apos;s account to view their report cards and academic reports.
        </p>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'messages':
      return <ParentMessagesSection />;
    case 'notifications':
      return renderNotifications();
    case 'schedule':
      return children ? (
        <ParentScheduleSection
          child={children[selectedChild] as ParentPortalChild | undefined}
        />
      ) : (
        renderSchedule()
      );
    case 'grades':
      return children ? (
        <ParentGradesSection
          subdomain={subdomain}
          child={children[selectedChild] as ParentPortalChild | undefined}
        />
      ) : (
        renderGrades()
      );
    case 'attendance':
      return children ? (
        <ParentAttendanceSection
          subdomain={subdomain}
          child={children[selectedChild] as ParentPortalChild | undefined}
        />
      ) : null;
    case 'payments':
      return children ? (
        <>
          {portalError ? (
            <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
              {portalError}
            </p>
          ) : null}
          <ParentFeesSection
            subdomain={subdomain}
            children={children as ParentPortalChild[]}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
            consolidatedFees={consolidatedFees}
          />
        </>
      ) : null;
    case 'reports':
      return children ? (
        <div className="space-y-8">
          <ParentReportCardSection
            subdomain={subdomain}
            child={children[selectedChild] as ParentPortalChild | undefined}
          />
          <ParentNotesSection
            subdomain={subdomain}
            child={children[selectedChild] as ParentPortalChild | undefined}
          />
        </div>
      ) : (
        renderReports()
      );
    default:
      return (
        <div className="text-center py-8 md:py-12 px-4">
          <h2 className="text-xl md:text-2xl font-black text-primary">Select a section from the sidebar</h2>
          <p className="text-slate-600 mt-2 text-sm md:text-base">Choose an option to view its content</p>
        </div>
      );
  }
}; 