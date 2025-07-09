'use client'

import React from 'react';
import { Clock, GraduationCap, Calendar, MapPin, TrendingUp, Award, CheckCircle, Bell } from 'lucide-react';

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

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface DesktopDashboardProps {
  children: Child[];
  selectedChild: number;
  setSelectedChild: (index: number) => void;
  todaySchedule: ScheduleItem[];
  recentGrades: Grade[];
  upcomingEvents: Event[];
  notifications: Notification[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-primary bg-primary/10 border-primary/20';
    case 'in-progress': return 'text-primary bg-primary/10 border-primary/20';
    case 'upcoming': return 'text-primary bg-primary/10 border-primary/20';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-primary bg-primary/10 border-primary/20';
  if (grade.startsWith('B')) return 'text-primary bg-primary/10 border-primary/20';
  if (grade.startsWith('C')) return 'text-primary bg-primary/10 border-primary/20';
  return 'text-red-600 bg-red-50 border-red-200';
};

export const DesktopDashboard = ({ 
  children, 
  selectedChild, 
  setSelectedChild, 
  todaySchedule, 
  recentGrades, 
  upcomingEvents, 
  notifications 
}: DesktopDashboardProps) => {
  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-8 border-2 border-primary/20 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Particles */}
          <div className="absolute top-4 right-8 w-3 h-3 bg-primary/20 rounded-full animate-bounce delay-100" />
          <div className="absolute top-12 right-16 w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-300" />
          <div className="absolute bottom-8 left-12 w-4 h-4 bg-primary/15 rounded-full animate-bounce delay-500" />
          <div className="absolute bottom-16 left-20 w-2.5 h-2.5 bg-primary/25 rounded-full animate-bounce delay-700" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-2xl animate-pulse delay-1000" />
          
          {/* Geometric Patterns */}
          <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-primary/10 rounded-full animate-spin-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-12 h-12 border border-primary/20 rotate-45 animate-pulse" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          {/* Decorative Line */}
          <div className="w-16 h-1 bg-gradient-to-r from-primary/60 to-transparent rounded-full mb-6" />
          
          {/* Enhanced Title */}
          <div className="mb-4">
            <h1 className="text-5xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-slate-800 via-primary to-slate-800 bg-clip-text text-transparent">
                Welcome back,
              </span>
            </h1>
            <h2 className="text-4xl font-black tracking-tight text-primary">
              Sarah Johnson!
            </h2>
          </div>
          
          {/* Enhanced Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-lg font-bold text-slate-600 tracking-wide">
              Here's what's happening with your children today
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <div className="w-2 h-2 bg-primary/80 rounded-full animate-ping delay-300" />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-ping delay-600" />
          </div>
        </div>
        
        {/* Bottom Decorative Line */}
        <div className="absolute bottom-6 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Enhanced Child Selector */}
      <div className="flex space-x-6 mb-8">
        {children.map((child, index) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(index)}
            className={`flex items-center space-x-4 p-6 rounded-2xl border-2 transition-all duration-300 group ${
              selectedChild === index 
                ? 'bg-primary text-white border-primary shadow-xl scale-105' 
                : 'bg-white border-primary/20 text-slate-700 hover:border-primary/30 hover:shadow-lg hover:scale-105'
            }`}
          >
            <div className="relative">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{child.avatar}</span>
              {selectedChild === index && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-primary animate-pulse" />
              )}
            </div>
            <div className="text-left">
              <div className="font-black text-lg group-hover:text-primary transition-colors">
                {child.name}
              </div>
              <div className="text-sm font-medium">{child.grade} - {child.class}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium uppercase tracking-wider">Attendance</p>
              <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {children[selectedChild].attendance}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <div className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium uppercase tracking-wider">Current GPA</p>
              <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {children[selectedChild].currentGPA}
              </p>
            </div>
            <Award className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <div className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium uppercase tracking-wider">Behavior</p>
              <p className="text-2xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {children[selectedChild].behavior}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <div className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium uppercase tracking-wider">Notifications</p>
              <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
            <Bell className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Enhanced Today's Schedule */}
        <div className="col-span-2 bg-white border-2 border-primary/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-black mb-6 flex items-center text-primary">
            <Clock className="w-7 h-7 mr-3 text-primary" />
            Today's Schedule
          </h2>
          <div className="space-y-4">
            {todaySchedule.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center space-x-6 p-4 hover:bg-primary/5 rounded-xl transition-all duration-300 group">
                <div className="text-sm font-bold text-slate-600 w-24">{item.time}</div>
                <div className="flex-1">
                  <div className="font-black text-slate-800 text-lg group-hover:scale-105 transition-transform">
                    {item.subject}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">{item.teacher} • {item.room}</div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-black shadow-lg border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Recent Grades */}
        <div className="bg-white border-2 border-primary/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-black mb-6 flex items-center text-primary">
            <GraduationCap className="w-7 h-7 mr-3 text-primary" />
            Recent Grades
          </h2>
          <div className="space-y-4">
            {recentGrades.slice(0, 4).map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-primary/5 rounded-xl transition-all duration-300 group">
                <div>
                  <div className="font-black text-slate-800 text-lg group-hover:scale-105 transition-transform">
                    {grade.subject}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">{grade.assignment}</div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-black shadow-lg border ${getGradeColor(grade.grade)}`}>
                  {grade.grade}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Upcoming Events */}
      <div className="bg-white border-2 border-primary/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h2 className="text-2xl font-black mb-6 flex items-center text-primary">
          <Calendar className="w-7 h-7 mr-3 text-primary" />
          Upcoming Events
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="border-2 border-primary/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-white group hover:scale-105">
              <div className="font-black text-slate-800 text-lg mb-3 group-hover:text-primary transition-colors">
                {event.title}
              </div>
              <div className="text-sm text-slate-600 space-y-2 font-medium">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 