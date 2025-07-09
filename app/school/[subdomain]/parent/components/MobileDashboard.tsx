'use client'

import React from 'react';
import { Clock, GraduationCap, MessageCircle, Calendar, Bell, ChevronRight } from 'lucide-react';

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
  id: number;
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
  if (grade.startsWith('A')) return 'text-primary bg-primary/10 border border-primary/20';
  if (grade.startsWith('B')) return 'text-primary bg-primary/10 border border-primary/20';
  if (grade.startsWith('C')) return 'text-primary bg-primary/10 border border-primary/20';
  return 'text-red-600 bg-red-50 border border-red-200';
};

export const MobileDashboard = ({ 
  children, 
  selectedChild, 
  setSelectedChild, 
  todaySchedule, 
  recentGrades, 
  notifications, 
  subdomain 
}: MobileDashboardProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Student Profile Header */}
      <div className="relative pt-12 pb-8 px-6">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 rounded-b-[3rem]" />
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
        
        {/* Student Avatar and Info */}
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
            <p className="text-slate-600 font-medium tracking-wide">
              {children[selectedChild].grade} • {children[selectedChild].class}
            </p>
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
                {children[selectedChild].currentGPA}
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
        <div className="bg-white border-2 border-primary/20 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black flex items-center text-primary">
              <Clock className="w-6 h-6 mr-3 text-primary" />
              Today's Schedule
            </h2>
            <button className="text-primary text-sm font-bold hover:scale-105 transition-transform">View All</button>
          </div>
          <div className="space-y-3">
            {todaySchedule.slice(0, 2).map((item, index) => (
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
            ))}
          </div>
        </div>

        {/* Recent Grades Card */}
        <div className="bg-white border-2 border-primary/20 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black flex items-center text-primary">
              <GraduationCap className="w-6 h-6 mr-3 text-primary" />
              Recent Grades
            </h2>
            <button className="text-primary text-sm font-bold hover:scale-105 transition-transform">View All</button>
          </div>
          <div className="space-y-3">
            {recentGrades.slice(0, 2).map((grade, index) => (
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
            ))}
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