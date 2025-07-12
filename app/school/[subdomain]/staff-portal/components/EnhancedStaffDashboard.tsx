"use client"

import React, { useState } from "react";
import { 
  Users, 
  FileText, 
  Building2, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  Settings,
  Clock,
  Send,
  Inbox,
  Phone,
  Mail,
  Shield,
  Home,
  BarChart3,
  CheckCircle2,
  User,
  TrendingUp,
  Copy,
  Search,
  Bell,
  Archive,
  Monitor,
  Wrench,
  HelpCircle,
  AlertCircle,
  CheckSquare,
  UserCheck,
  Activity,
  Award,
  MapPin,
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { DynamicLogo } from '../../parent/components/DynamicLogo';

// Mock data for demonstration
const mockData = {
  tasks: [
    { id: 1, title: "Update student records", priority: "high", dueDate: "2024-01-15", status: "pending" },
    { id: 2, title: "Prepare monthly report", priority: "medium", dueDate: "2024-01-20", status: "in_progress" },
    { id: 3, title: "Facility maintenance check", priority: "low", dueDate: "2024-01-25", status: "completed" }
  ],
  messages: [
    { id: 1, from: "Administration", subject: "Staff Meeting", unread: true, time: "2 hours ago" },
    { id: 2, from: "Principal", subject: "Monthly Report", unread: false, time: "1 day ago" },
    { id: 3, from: "IT Support", subject: "System Update", unread: true, time: "3 hours ago" }
  ],
  notifications: [
    { id: 1, type: "reminder", title: "Submit timesheet", time: "30 minutes ago" },
    { id: 2, type: "alert", title: "Fire drill scheduled", time: "1 hour ago" }
  ],
  facilities: [
    { id: 1, name: "Main Office", status: "operational", lastChecked: "2024-01-10" },
    { id: 2, name: "Library", status: "maintenance", lastChecked: "2024-01-08" },
    { id: 3, name: "Computer Lab", status: "operational", lastChecked: "2024-01-12" }
  ]
};

interface Action {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgClass: string;
}

interface EnhancedStaffDashboardProps {
  subdomain: string;
}

export default function EnhancedStaffDashboard({ subdomain }: EnhancedStaffDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [showTasks, setShowTasks] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const handleActionClick = (actionId: string) => {
    console.log(`Action ${actionId} clicked`);
    // Handle different actions for staff
    switch (actionId) {
      case 'administrative-tasks':
        setShowTasks(true);
        break;
      case 'send-message':
        setShowMessages(true);
        break;
      case 'staff-directory':
        setShowDirectory(true);
        break;
      case 'generate-reports':
        setShowReports(true);
        break;
      case 'facility-management':
        setShowFacilities(true);
        break;
      case 'support-tickets':
        setShowSupport(true);
        break;
      default:
        console.log(`Action ${actionId} not implemented yet`);
    }
  };

  // Staff-specific quick actions
  const quickActions: Action[] = [
    {
      id: 'administrative-tasks',
      title: 'Administrative Tasks',
      icon: <ClipboardList className="w-6 h-6" />,
      onClick: () => setShowTasks(true),
      bgClass: 'bg-primary',
    },
    {
      id: 'send-message',
      title: 'Send Message',
      icon: <Send className="w-6 h-6" />,
      onClick: () => setShowMessages(true),
      bgClass: 'bg-primary',
    },
    {
      id: 'staff-directory',
      title: 'Staff Directory',
      icon: <Users className="w-6 h-6" />,
      onClick: () => setShowDirectory(true),
      bgClass: 'bg-primary',
    },
    {
      id: 'generate-reports',
      title: 'Generate Reports',
      icon: <FileText className="w-6 h-6" />,
      onClick: () => setShowReports(true),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'facility-management',
      title: 'Facility Management',
      icon: <Building2 className="w-6 h-6" />,
      onClick: () => setShowFacilities(true),
      bgClass: 'bg-primary',
    },
    {
      id: 'support-tickets',
      title: 'Support Tickets',
      icon: <HelpCircle className="w-6 h-6" />,
      onClick: () => setShowSupport(true),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'schedule-view',
      title: 'View Schedule',
      icon: <Calendar className="w-6 h-6" />,
      onClick: () => handleActionClick('schedule-view'),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-6 h-6" />,
      onClick: () => handleActionClick('notifications'),
      bgClass: 'bg-primary',
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      icon: <Settings className="w-6 h-6" />,
      onClick: () => handleActionClick('system-settings'),
      bgClass: 'bg-primary/80',
    },
    {
      id: 'attendance-tracking',
      title: 'Attendance Tracking',
      icon: <UserCheck className="w-6 h-6" />,
      onClick: () => handleActionClick('attendance-tracking'),
      bgClass: 'bg-primary',
    },
    {
      id: 'contact-management',
      title: 'Contact Management',
      icon: <Phone className="w-6 h-6" />,
      onClick: () => handleActionClick('contact-management'),
      bgClass: 'bg-primary/80',
    },
  ];

  const renderQuickActions = () => (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-3xl w-full">
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

  // Staff-specific stats
  const staffStats = {
    tasksCompleted: 12,
    tasksPending: 4,
    messagesUnread: 3,
    notificationsNew: 2,
    facilitiesOperational: 8,
    facilitiesNeedMaintenance: 2,
    workingHours: "8:00 AM - 5:00 PM",
    currentStatus: "On Duty"
  };

  const renderStaffStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 w-full max-w-5xl mx-auto">
      {/* Current Status */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Status</span>
        </div>
        <div className="text-sm font-bold text-foreground text-center">{staffStats.currentStatus}</div>
        <div className="text-xs text-muted-foreground">{staffStats.workingHours}</div>
      </div>

      {/* Pending Tasks */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <ClipboardList className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Pending Tasks</span>
        <span className="text-xl font-bold text-foreground">{staffStats.tasksPending}</span>
      </div>

      {/* Completed Tasks */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <CheckSquare className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Completed Tasks</span>
        <span className="text-xl font-bold text-foreground">{staffStats.tasksCompleted}</span>
      </div>

      {/* Unread Messages */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Inbox className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Unread Messages</span>
        <span className="text-xl font-bold text-foreground">{staffStats.messagesUnread}</span>
      </div>

      {/* New Notifications */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Bell className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">New Notifications</span>
        <span className="text-xl font-bold text-foreground">{staffStats.notificationsNew}</span>
      </div>

      {/* Facilities Status */}
      <div className="flex flex-col items-center justify-center bg-card border border-primary/20 p-3 shadow-sm">
        <Building2 className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs font-semibold text-foreground">Facilities</span>
        <span className="text-sm font-bold text-foreground">{staffStats.facilitiesOperational} OK, {staffStats.facilitiesNeedMaintenance} Maint.</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-card/95 via-white/90 to-primary/10 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-primary/20 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Shield className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Staff Portal</h1>
                <p className="text-sm text-muted-foreground/90 font-medium">Welcome back! Manage your administrative tasks.</p>
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
          
          {/* Render different sections based on state */}
          {showTasks ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Administrative Tasks</h2>
              <p className="text-muted-foreground mb-6">Task management section will be implemented here</p>
              <button 
                onClick={() => setShowTasks(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          ) : showMessages ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Messages</h2>
              <p className="text-muted-foreground mb-6">Messaging section will be implemented here</p>
              <button 
                onClick={() => setShowMessages(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          ) : showDirectory ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Staff Directory</h2>
              <p className="text-muted-foreground mb-6">Staff directory section will be implemented here</p>
              <button 
                onClick={() => setShowDirectory(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          ) : showReports ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Generate Reports</h2>
              <p className="text-muted-foreground mb-6">Reports section will be implemented here</p>
              <button 
                onClick={() => setShowReports(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          ) : showFacilities ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Facility Management</h2>
              <p className="text-muted-foreground mb-6">Facility management section will be implemented here</p>
              <button 
                onClick={() => setShowFacilities(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          ) : showSupport ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Support Tickets</h2>
              <p className="text-muted-foreground mb-6">Support tickets section will be implemented here</p>
              <button 
                onClick={() => setShowSupport(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {renderStaffStats()}
              {renderQuickActions()}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 