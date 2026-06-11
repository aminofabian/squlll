'use client'

import React from 'react';
import { Clock, GraduationCap, MessageCircle, Calendar, Bell, ChevronRight } from 'lucide-react';
import { ParentConsolidatedFeeCard } from './ParentConsolidatedFeeCard';
import type { ParentConsolidatedFees } from '@/lib/parent/parentFees';
import { childGradeSubtitle } from '@/lib/parent/displayName';
import { portalEmptyState, portalPanel } from './parent-portal-ui';
import { cn } from '@/lib/utils';

interface Child {
  id: number;
  name: string;
  grade: string;
  class: string;
  avatar: string;
  attendance: number;
  currentGPA: number;
  behavior: string;
}

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

interface MobileDashboardProps {
  children: Child[];
  selectedChild: number;
  setSelectedChild: (index: number) => void;
  todaySchedule: ScheduleItem[];
  recentGrades: Grade[];
  notifications: Notification[];
  subdomain: string;
  averageGpa?: number | null;
  dashboardLoading?: boolean;
  consolidatedFees?: ParentConsolidatedFees | null;
  feesLoading?: boolean;
  onFeesRefresh?: () => void;
  onSelectChildByStudentId?: (studentId: string) => void;
  onPayFees?: () => void;
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

export const MobileDashboard = ({ 
  children, 
  selectedChild, 
  setSelectedChild, 
  todaySchedule, 
  recentGrades, 
  notifications, 
  subdomain,
  averageGpa = null,
  dashboardLoading = false,
  consolidatedFees = null,
  feesLoading = false,
  onFeesRefresh,
  onSelectChildByStudentId,
  onPayFees,
}: MobileDashboardProps) => {
  const displayGpa = averageGpa ?? children[selectedChild].currentGPA;
  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950">
      <div className="relative px-4 pb-6 pt-4">
        <div className="absolute inset-x-0 top-0 h-48 rounded-b-3xl bg-gradient-to-b from-primary/8 to-transparent" />

        <div className="relative z-10 text-center">
          {/* Child Selector Dots */}
          <div className="flex justify-center space-x-3 mb-8">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedChild(index)}
                className={`transition-all duration-300 ease-out ${
                  selectedChild === index 
                    ? 'w-8 h-2 bg-primary rounded-full shadow-lg' 
                    : 'w-2 h-2 bg-primary/30 rounded-full hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
          
          {/* Student Avatar with Enhanced Design */}
          <div className="relative mx-auto mb-6">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            
            {/* Main Avatar */}
            <div className="relative w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-2xl border-4 border-white backdrop-blur-sm">
              <span className="text-5xl text-white drop-shadow-lg">{children[selectedChild].avatar}</span>
              
              {/* Decorative Elements */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-primary shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary/60 rounded-full animate-bounce" />
              <div className="absolute -bottom-2 right-2 w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-500" />
            </div>
          </div>
          
          {/* Student Name and Details with Better Typography */}
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {children[selectedChild].name}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {childGradeSubtitle(children[selectedChild])}
            </p>
          </div>

          <div className="mb-6 text-left">
            <ParentConsolidatedFeeCard
              summary={consolidatedFees}
              loading={feesLoading}
              onRefresh={onFeesRefresh}
              onSelectChild={onSelectChildByStudentId}
              onPayFees={onPayFees}
            />
          </div>
          
          {/* Enhanced Quick Stats Row */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center group">
              <div className="text-3xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {children[selectedChild].attendance}%
              </div>
              <div className="text-xs text-slate-600 font-medium tracking-wider uppercase">
                Attendance
              </div>
            </div>
            <div className="w-px bg-primary/20 h-12 self-center" />
            <div className="text-center group">
              <div className="text-3xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {displayGpa}
              </div>
              <div className="text-xs text-slate-600 font-medium tracking-wider uppercase">
                GPA
              </div>
            </div>
            <div className="w-px bg-primary/20 h-12 self-center" />
            <div className="text-center group">
              <div className="text-xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {children[selectedChild].behavior}
              </div>
              <div className="text-xs text-slate-600 font-medium tracking-wider uppercase">
                Behavior
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards with Enhanced Spacing */}
      <div className="px-6 space-y-6 pb-8">
        {/* Today's Schedule Card */}
        <div className={cn(portalPanel, "p-4")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center text-base font-semibold text-slate-900 dark:text-slate-100">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Today&apos;s schedule
            </h2>
          </div>
          <div className="space-y-3">
            {dashboardLoading && todaySchedule.length === 0 ? (
              <p className="text-sm text-slate-500">Loading schedule…</p>
            ) : todaySchedule.length === 0 ? (
              <p className="text-sm text-slate-500">No lessons today.</p>
            ) : (
              todaySchedule.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all duration-300 group">
                <div className="text-sm font-bold text-slate-600 w-16">{item.time}</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm group-hover:scale-105 transition-transform">
                    {item.subject}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{item.teacher}</div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))
            )}
          </div>
        </div>

        <div className={cn(portalPanel, "p-4")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center text-base font-semibold text-slate-900 dark:text-slate-100">
              <GraduationCap className="mr-2 h-5 w-5 text-primary" />
              Recent grades
            </h2>
          </div>
          <div className="space-y-3">
            {dashboardLoading && recentGrades.length === 0 ? (
              <p className="text-sm text-slate-500">Loading grades…</p>
            ) : recentGrades.length === 0 ? (
              <p className="text-sm text-slate-500">No grades yet.</p>
            ) : (
              recentGrades.slice(0, 2).map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all duration-300 group">
                <div>
                  <div className="font-bold text-slate-800 text-sm group-hover:scale-105 transition-transform">
                    {grade.subject}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{grade.assignment}</div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-black shadow-lg ${getGradeColor(grade.grade)}`}>
                  {grade.grade}
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-primary text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-center space-x-3">
              <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="font-black text-lg">Messages</span>
            </div>
          </button>
          <button className="bg-primary text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-center space-x-3">
              <Calendar className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="font-black text-lg">Schedule</span>
            </div>
          </button>
        </div>

        {/* Enhanced Notifications Summary */}
        <div className="bg-white border-2 border-primary/20 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-7 h-7 text-primary group-hover:animate-bounce transition-all" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-black animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div>
                <div className="font-black text-slate-800 text-lg">Notifications</div>
                <div className="text-xs text-slate-600 font-medium">
                  {notifications.filter(n => !n.read).length} new messages
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}; 