'use client'

import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  GraduationCap, 
  DollarSign, 
  MessageCircle, 
  FileText, 
  Settings, 
  LogOut, 
  Bell,
  Sparkles,
  Zap,
  Star,
  Heart,
  Target,
  TrendingUp,
  Award,
  Shield,
  Crown,
  Rocket,
  Palette,
  Music,
  Camera,
  Gift,
  Coffee,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { DynamicLogo } from './DynamicLogo';

interface SidebarItem {
  icon: any;
  label: string;
  key: string;
  category: string;
  color: string;
  gradient: string;
  description: string;
  badge?: string;
}

interface Assignment {
  id: number;
  subject: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

interface DesktopSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subdomain: string;
  notifications: Array<{ read: boolean }>;
}

export const DesktopSidebar = ({ activeTab, setActiveTab, subdomain, notifications }: DesktopSidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [showAssignments, setShowAssignments] = useState(true);

  // Mock assignment data
  const assignments: Assignment[] = [
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Algebra Problem Set #5',
      dueDate: '2024-07-10',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      subject: 'English',
      title: 'Essay: Shakespeare Analysis',
      dueDate: '2024-07-12',
      status: 'submitted',
      priority: 'medium'
    },
    {
      id: 3,
      subject: 'Science',
      title: 'Lab Report: Chemistry',
      dueDate: '2024-07-08',
      status: 'overdue',
      priority: 'high'
    },
    {
      id: 4,
      subject: 'History',
      title: 'Research Paper: World War II',
      dueDate: '2024-07-15',
      status: 'pending',
      priority: 'low'
    }
  ];

  const sidebarItems: SidebarItem[] = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      key: 'dashboard',
      category: 'Main',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'from-blue-400 via-cyan-400 to-blue-600',
      description: 'Overview & Analytics',
      badge: 'Live'
    },
    { 
      icon: Calendar, 
      label: 'Schedule', 
      key: 'schedule',
      category: 'Academic',
      color: 'from-purple-500 to-pink-500',
      gradient: 'from-purple-400 via-pink-400 to-purple-600',
      description: 'Class Timetables'
    },
    { 
      icon: GraduationCap, 
      label: 'Grades', 
      key: 'grades',
      category: 'Academic',
      color: 'from-green-500 to-emerald-500',
      gradient: 'from-green-400 via-emerald-400 to-green-600',
      description: 'Academic Performance',
      badge: 'New'
    },
    { 
      icon: DollarSign, 
      label: 'Payments', 
      key: 'payments',
      category: 'Financial',
      color: 'from-yellow-500 to-orange-500',
      gradient: 'from-yellow-400 via-orange-400 to-yellow-600',
      description: 'Fees & Transactions'
    },
    { 
      icon: MessageCircle, 
      label: 'Messages', 
      key: 'messages',
      category: 'Communication',
      color: 'from-red-500 to-rose-500',
      gradient: 'from-red-400 via-rose-400 to-red-600',
      description: 'Teacher Communication',
      badge: `${notifications.filter(n => !n.read).length}`
    },
    { 
      icon: FileText, 
      label: 'Reports', 
      key: 'reports',
      category: 'Analytics',
      color: 'from-indigo-500 to-blue-500',
      gradient: 'from-indigo-400 via-blue-400 to-indigo-600',
      description: 'Academic Reports'
    }
  ];

  const categories = [...new Set(sidebarItems.map(item => item.category))];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-primary bg-primary/10 border-primary/20';
      case 'medium': return 'text-primary bg-primary/10 border-primary/20';
      case 'low': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="w-80 bg-white shadow-2xl border-r-2 border-primary/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-bounce delay-100" />
        <div className="absolute top-40 right-8 w-1.5 h-1.5 bg-primary/25 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-32 left-16 w-2.5 h-2.5 bg-primary/20 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-20 right-12 w-1 h-1 bg-primary/30 rounded-full animate-bounce delay-700" />
        <div className="absolute top-60 left-20 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce delay-900" />
        <div className="absolute bottom-60 right-20 w-2 h-2 bg-primary/25 rounded-full animate-bounce delay-1100" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
        
        {/* Geometric Patterns */}
        <div className="absolute top-1/4 left-1/4 w-12 h-12 border border-primary/20 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-8 h-8 border border-primary/30 rotate-45 animate-pulse" />
        
        {/* Animated Lines */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-pulse delay-1000" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-8">
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          {/* Glow Effect */}
          <div className={`absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 rounded-2xl blur-xl transition-opacity duration-500 ${
            isLogoHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Logo Container */}
          <div className="relative bg-white backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/20 shadow-xl">
            <DynamicLogo subdomain={subdomain} size="lg" />
            
            {/* Floating Icons */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <Zap className="w-4 h-4 text-primary animate-pulse delay-300" />
              <Star className="w-4 h-4 text-primary animate-pulse delay-600" />
            </div>
            
            {/* Status Indicator */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-xs text-primary font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="relative z-10 px-6 space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center space-x-3 px-2">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {category}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
            </div>
            
            {/* Category Items */}
            <div className="space-y-2">
              {sidebarItems
                .filter(item => item.category === category)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  const isHovered = hoveredItem === item.key;
                  
                  return (
                    <div
                      key={item.key}
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setHoveredItem(item.key)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => setActiveTab(item.key)}
                    >
                      {/* Background Glow */}
                      <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                        isActive 
                          ? 'bg-primary opacity-100' 
                          : isHovered 
                            ? 'bg-primary/20 opacity-100' 
                            : 'opacity-0'
                      }`} />
                      
                      {/* Main Button */}
                      <div
                        className={`relative w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
                          isActive 
                            ? 'text-white shadow-xl scale-105' 
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {/* Icon Container */}
                        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/20 backdrop-blur-sm' 
                            : 'bg-slate-100/50 group-hover:bg-slate-200/50'
                        }`}>
                          <Icon className={`w-5 h-5 transition-all duration-300 ${
                            isActive ? 'animate-pulse' : 'group-hover:scale-110'
                          }`} />
                          
                          {/* Icon Glow */}
                          <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                            isActive ? 'opacity-100' : 'opacity-0'
                          }`} style={{
                            background: `radial-gradient(circle, #ffffff40, transparent 70%)`
                          }} />
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm">{item.label}</span>
                            {item.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                                item.badge === 'Live' 
                                  ? 'bg-primary/20 text-primary' 
                                  : item.badge === 'New'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-primary/20 text-primary'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-100 group-hover:text-slate-600 transition-colors text-white">
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Arrow Indicator */}
                        <div className={`w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 group-hover:opacity-50'
                        }`}>
                          <div className="w-2 h-2 bg-current rounded-full" />
                        </div>
                      </div>
                      
                      {/* Hover Effects */}
                      {isHovered && !isActive && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Student Assignments Section */}
      <div className="relative z-10 px-6 mt-8">
        <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800">Student Assignments</h3>
            </div>
            <button 
              onClick={() => setShowAssignments(!showAssignments)}
              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-primary" />
            </button>
          </div>
          
          {showAssignments && (
            <div className="space-y-3">
              {assignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="bg-white border border-primary/20 rounded-xl p-4 hover:shadow-md transition-all duration-300 group cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-slate-500">{assignment.subject}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(assignment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Due: {assignment.dueDate}</span>
                    <button className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300 group cursor-pointer">
                      <Download className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-full p-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>View All Assignments</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-full p-6 space-y-3">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="p-3 rounded-xl bg-white border-2 border-primary/20 hover:border-primary/30 transition-all duration-300 group cursor-pointer">
            <Settings className="w-5 h-5 text-primary group-hover:text-primary/80 group-hover:rotate-90 transition-transform" />
          </button>
          <button className="p-3 rounded-xl bg-white border-2 border-primary/20 hover:border-primary/30 transition-all duration-300 group cursor-pointer">
            <LogOut className="w-5 h-5 text-primary group-hover:text-primary/80 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
        
        {/* Status Bar */}
        <div className="bg-white border-2 border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">SYSTEM STATUS</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Performance</span>
              <span className="text-primary font-bold">98%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Uptime</span>
              <span className="text-primary font-bold">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/10 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-primary/10 to-primary/10 rounded-tr-full" />
    </div>
  );
}; 