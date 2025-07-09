'use client'

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { MobileDashboard } from './components/MobileDashboard';
import { DesktopDashboard } from './components/DesktopDashboard';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ContentRenderer } from './components/ContentRenderer';
import { PaymentsSection } from './components/PaymentsSection';

const ParentsPortal = () => {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChild, setSelectedChild] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'grade', message: 'New grade posted for Mathematics', time: '2 hours ago', read: false },
    { id: 2, type: 'event', message: 'Parent-Teacher Conference scheduled', time: '1 day ago', read: false },
    { id: 3, type: 'payment', message: 'Monthly fee payment due in 3 days', time: '2 days ago', read: true }
  ]);

  const children = [
    {
      id: 1,
      name: 'Emma Johnson',
      grade: 'Grade 7',
      class: '7A',
      avatar: '👧',
      attendance: 96,
      currentGPA: 3.8,
      behavior: 'Excellent'
    },
    {
      id: 2,
      name: 'Michael Johnson',
      grade: 'Grade 4',
      class: '4B',
      avatar: '👦',
      attendance: 94,
      currentGPA: 3.6,
      behavior: 'Good'
    }
  ];

  const todaySchedule = [
    { time: '8:00 AM', subject: 'Mathematics', teacher: 'Ms. Smith', room: 'Room 201', status: 'completed' },
    { time: '9:00 AM', subject: 'English Literature', teacher: 'Mr. Brown', room: 'Room 105', status: 'completed' },
    { time: '10:00 AM', subject: 'Science', teacher: 'Dr. Wilson', room: 'Lab 1', status: 'in-progress' },
    { time: '11:00 AM', subject: 'History', teacher: 'Mrs. Davis', room: 'Room 303', status: 'upcoming' },
    { time: '1:00 PM', subject: 'Physical Education', teacher: 'Coach Martinez', room: 'Gymnasium', status: 'upcoming' },
    { time: '2:00 PM', subject: 'Art', teacher: 'Ms. Taylor', room: 'Art Studio', status: 'upcoming' }
  ];

  const recentGrades = [
    { subject: 'Mathematics', assignment: 'Algebra Test', grade: 'A-', points: '87/100', date: '2024-07-08' },
    { subject: 'English', assignment: 'Essay Writing', grade: 'B+', points: '82/100', date: '2024-07-07' },
    { subject: 'Science', assignment: 'Lab Report', grade: 'A', points: '94/100', date: '2024-07-06' },
    { subject: 'History', assignment: 'Research Project', grade: 'B', points: '78/100', date: '2024-07-05' }
  ];

  const upcomingEvents = [
    { title: 'Parent-Teacher Conference', date: '2024-07-15', time: '3:00 PM', location: 'Main Hall' },
    { title: 'Science Fair', date: '2024-07-20', time: '10:00 AM', location: 'School Auditorium' },
    { title: 'Sports Day', date: '2024-07-25', time: '9:00 AM', location: 'Sports Ground' },
    { title: 'Art Exhibition', date: '2024-07-30', time: '2:00 PM', location: 'Art Gallery' }
  ];

  const teacherMessages = [
    {
      id: 1,
      teacher: 'Ms. Smith',
      subject: 'Mathematics',
      message: 'Emma has shown excellent progress in algebra. She\'s ready for advanced topics.',
      time: '2 hours ago',
      avatar: '👩‍🏫'
    },
    {
      id: 2,
      teacher: 'Mr. Brown',
      subject: 'English Literature',
      message: 'Please encourage Emma to participate more in class discussions.',
      time: '1 day ago',
      avatar: '👨‍🏫'
    },
    {
      id: 3,
      teacher: 'Dr. Wilson',
      subject: 'Science',
      message: 'Great work on the recent lab experiment! Emma showed real scientific thinking.',
      time: '2 days ago',
      avatar: '👩‍🔬'
    }
  ];

  // Desktop Layout
  const renderDesktopLayout = () => (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Sidebar */}
      <DesktopSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subdomain={subdomain}
        notifications={notifications}
      />

      {/* Enhanced Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-10">
          {activeTab === 'dashboard' ? (
            <DesktopDashboard 
              children={children}
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              todaySchedule={todaySchedule}
              recentGrades={recentGrades}
              upcomingEvents={upcomingEvents}
              notifications={notifications}
            />
          ) : (
            <ContentRenderer 
              activeTab={activeTab}
              todaySchedule={todaySchedule}
              teacherMessages={teacherMessages}
              notifications={notifications}
              children={children}
              selectedChild={selectedChild}
            />
          )}
        </div>
      </div>

      {/* Enhanced Notifications Panel */}
      <NotificationsPanel 
        notifications={notifications}
        variant="desktop"
      />
    </div>
  );

  // Mobile Layout
  const renderMobileLayout = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Mobile Header */}
      <MobileHeader subdomain={subdomain} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'dashboard' ? (
          <MobileDashboard 
            children={children}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            todaySchedule={todaySchedule}
            recentGrades={recentGrades}
            notifications={notifications}
            subdomain={subdomain}
          />
        ) : (
          <div className="p-6">
            <ContentRenderer 
              activeTab={activeTab}
              todaySchedule={todaySchedule}
              teacherMessages={teacherMessages}
              notifications={notifications}
              children={children}
              selectedChild={selectedChild}
            />
          </div>
        )}
      </div>

      {/* Enhanced Bottom Navigation - Mobile App Style */}
      <MobileBottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
      />

      {/* Enhanced Notifications Panel - Mobile Slide Over */}
      <NotificationsPanel 
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        variant="mobile"
      />
    </div>
  );

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {renderDesktopLayout()}
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {renderMobileLayout()}
      </div>
    </>
  );
};

export default ParentsPortal;