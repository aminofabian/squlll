'use client'

import React from 'react';
import { PaymentsSection } from './PaymentsSection';

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

interface TeacherMessage {
  id: number;
  teacher: string;
  subject: string;
  message: string;
  time: string;
  avatar: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

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

interface ContentRendererProps {
  activeTab: string;
  todaySchedule: ScheduleItem[];
  teacherMessages: TeacherMessage[];
  notifications: Notification[];
  children?: Child[];
  selectedChild?: number;
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

export const ContentRenderer = ({ 
  activeTab, 
  todaySchedule, 
  teacherMessages, 
  notifications,
  children,
  selectedChild = 0
}: ContentRendererProps) => {
  const renderMessages = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl">
        <div className="p-4 md:p-6 border-b-2 border-primary/20">
          <h2 className="text-lg md:text-xl font-black text-primary">Messages from Teachers</h2>
        </div>
        <div className="divide-y-2 divide-primary/20">
          {teacherMessages.map((message) => (
            <div key={message.id} className="p-4 md:p-6 hover:bg-primary/5 transition-colors">
              <div className="flex items-start space-x-3 md:space-x-4">
                <span className="text-xl md:text-2xl flex-shrink-0">{message.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-black text-slate-800 text-sm md:text-base">{message.teacher}</span>
                      <span className="text-xs md:text-sm text-slate-600 sm:ml-2">• {message.subject}</span>
                    </div>
                    <span className="text-xs md:text-sm text-slate-600">{message.time}</span>
                  </div>
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed">{message.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black mb-2">Academic Performance</h1>
            <p className="text-white/90 font-medium text-sm md:text-base">Track your child's academic progress</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl">📚</span>
            <span className="text-xs md:text-sm font-black">EXCELLENT</span>
          </div>
        </div>
        
        {/* GPA Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-medium">Current GPA</p>
                <p className="text-2xl md:text-3xl font-black">3.8</p>
              </div>
              <span className="text-xl md:text-2xl">⭐</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-medium">Class Rank</p>
                <p className="text-2xl md:text-3xl font-black">5th</p>
              </div>
              <span className="text-xl md:text-2xl">🏆</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-medium">Subjects</p>
                <p className="text-2xl md:text-3xl font-black">8</p>
              </div>
              <span className="text-xl md:text-2xl">📖</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Grades */}
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl">
        <div className="p-4 md:p-6 border-b-2 border-primary/20">
          <h2 className="text-lg md:text-xl font-black text-primary">Recent Grades</h2>
        </div>
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          {[
            { subject: 'Mathematics', assignment: 'Algebra Test', grade: 'A-', points: '87/100', date: '2024-07-08' },
            { subject: 'English', assignment: 'Essay Writing', grade: 'B+', points: '82/100', date: '2024-07-07' },
            { subject: 'Science', assignment: 'Lab Report', grade: 'A', points: '94/100', date: '2024-07-06' },
            { subject: 'History', assignment: 'Research Project', grade: 'B', points: '78/100', date: '2024-07-05' },
            { subject: 'Physical Education', assignment: 'Fitness Assessment', grade: 'A', points: '95/100', date: '2024-07-04' },
            { subject: 'Art', assignment: 'Portfolio Review', grade: 'A+', points: '98/100', date: '2024-07-03' }
          ].map((grade, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border-2 border-primary/20 rounded-xl hover:bg-primary/5 transition-colors space-y-2 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-800 text-sm md:text-base">{grade.subject}</div>
                <div className="text-xs md:text-sm text-slate-600">{grade.assignment}</div>
                <div className="text-xs text-slate-600">{grade.date}</div>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="text-right">
                  <div className="text-xs md:text-sm text-slate-600">{grade.points}</div>
                </div>
                <div className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-black ${getGradeColor(grade.grade)}`}>
                  {grade.grade}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black mb-2">Academic Reports</h1>
            <p className="text-white/90 font-medium text-sm md:text-base">Comprehensive analysis and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl">📊</span>
            <span className="text-xs md:text-sm font-black">ANALYTICS</span>
          </div>
        </div>
        
        {/* Report Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-medium">Reports Generated</p>
                <p className="text-2xl md:text-3xl font-black">12</p>
              </div>
              <span className="text-xl md:text-2xl">📋</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-medium">This Month</p>
                <p className="text-2xl md:text-3xl font-black">3</p>
              </div>
              <span className="text-xl md:text-2xl">📅</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-medium">Available</p>
                <p className="text-2xl md:text-3xl font-black">5</p>
              </div>
              <span className="text-xl md:text-2xl">📥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl">
        <div className="p-4 md:p-6 border-b-2 border-primary/20">
          <h2 className="text-lg md:text-xl font-black text-primary">Available Reports</h2>
        </div>
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          {[
            { title: 'Quarterly Progress Report', type: 'Academic', date: '2024-07-01', status: 'Available' },
            { title: 'Attendance Summary', type: 'Behavioral', date: '2024-06-30', status: 'Available' },
            { title: 'Performance Analytics', type: 'Analytics', date: '2024-06-25', status: 'Available' },
            { title: 'Subject-wise Analysis', type: 'Academic', date: '2024-06-20', status: 'Available' },
            { title: 'Year-end Summary', type: 'Comprehensive', date: '2024-06-15', status: 'Available' }
          ].map((report, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border-2 border-primary/20 rounded-xl hover:bg-primary/5 transition-colors space-y-3 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-800 text-sm md:text-base">{report.title}</div>
                <div className="text-xs md:text-sm text-slate-600">{report.type} • {report.date}</div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
                <span className="px-3 md:px-4 py-1 md:py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black self-start sm:self-auto">
                  {report.status}
                </span>
                <button className="px-4 md:px-6 py-2 bg-primary text-white rounded-xl font-black hover:bg-primary/90 transition-colors shadow-lg text-sm md:text-base">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'messages':
      return renderMessages();
    case 'notifications':
      return renderNotifications();
    case 'schedule':
      return renderSchedule();
    case 'grades':
      return renderGrades();
    case 'payments':
      return children ? <PaymentsSection children={children} selectedChild={selectedChild} /> : null;
    case 'reports':
      return renderReports();
    default:
      return (
        <div className="text-center py-8 md:py-12 px-4">
          <h2 className="text-xl md:text-2xl font-black text-primary">Select a section from the sidebar</h2>
          <p className="text-slate-600 mt-2 text-sm md:text-base">Choose an option to view its content</p>
        </div>
      );
  }
}; 