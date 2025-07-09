'use client'

import React, { useState } from 'react';
import { Home, Calendar, GraduationCap, MessageCircle, Bell, MoreHorizontal, Settings, FileText, DollarSign, Users } from 'lucide-react';

interface BottomNavItem {
  icon: any;
  label: string;
  key: string;
}

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Array<{ read: boolean }>;
}

export const MobileBottomNav = ({ activeTab, setActiveTab, notifications }: MobileBottomNavProps) => {
  const [showMore, setShowMore] = useState(false);
  
  const bottomNavItems: BottomNavItem[] = [
    { icon: Calendar, label: 'Schedule', key: 'schedule' },
    { icon: GraduationCap, label: 'Grades', key: 'grades' },
    { icon: MessageCircle, label: 'Messages', key: 'messages' },
    { icon: Bell, label: 'Notifications', key: 'notifications' }
  ];

  const moreMenuItems: BottomNavItem[] = [
    { icon: DollarSign, label: 'Payments', key: 'payments' },
    { icon: FileText, label: 'Reports', key: 'reports' },
    { icon: Users, label: 'Staff', key: 'staff' },
    { icon: Settings, label: 'Settings', key: 'settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary/20 shadow-2xl">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      
      {/* More Menu Overlay */}
      {showMore && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t-2 border-primary/20 shadow-2xl rounded-t-3xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800">More Options</h3>
              <button 
                onClick={() => setShowMore(false)}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all duration-300"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {moreMenuItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveTab(item.key);
                      setShowMore(false);
                    }}
                    className={`flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg scale-105' 
                        : 'bg-primary/5 text-slate-700 hover:bg-primary/10 hover:scale-105'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 transition-all duration-300 ${
                      isActive ? 'animate-pulse' : 'group-hover:scale-110'
                    }`} />
                    <span className="text-xs font-black">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        {/* Left Side Items */}
        <div className="flex items-center space-x-2">
          {bottomNavItems.slice(0, 2).map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'animate-pulse' : 'group-hover:scale-110'
                  }`} />
                </div>
                <span className="text-xs font-black">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Center Home Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`relative flex flex-col items-center transition-all duration-300 group transform -translate-y-2`}
          >
            <div className="relative">
              {/* Glow Effect for Home */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                activeTab === 'dashboard' ? 'bg-primary/20 blur-md scale-150' : 'opacity-0'
              }`} />
              
              {/* Main Home Button */}
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white shadow-xl scale-110' 
                  : 'bg-white border-2 border-primary/30 text-primary hover:border-primary/50 hover:scale-105'
              }`}>
                <Home className={`w-8 h-8 transition-all duration-300 ${
                  activeTab === 'dashboard' ? 'animate-pulse' : 'group-hover:scale-110'
                }`} />
                
                {/* Decorative Ring for Active State */}
                {activeTab === 'dashboard' && (
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
                )}
              </div>
              
              {/* Home Label */}
              <span className={`text-xs font-black mt-2 transition-all duration-300 ${
                activeTab === 'dashboard' ? 'text-primary' : 'text-slate-600'
              }`}>
                Home
              </span>
            </div>
          </button>
        </div>

        {/* Right Side Items */}
        <div className="flex items-center space-x-2">
          {bottomNavItems.slice(2, 4).map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'animate-pulse' : 'group-hover:scale-110'
                  }`} />
                  
                  {/* Notification Badge */}
                  {item.key === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-black animate-pulse border-2 border-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>
                <span className="text-xs font-black">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 group ${
              showMore 
                ? 'bg-primary/10 text-primary' 
                : 'text-slate-600 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className={`w-6 h-6 transition-all duration-300 ${
                showMore ? 'animate-pulse' : 'group-hover:scale-110'
              }`} />
              
              {/* Animated Dots */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex space-x-0.5 transition-all duration-300 ${
                  showMore ? 'opacity-0' : 'opacity-100'
                }`}>
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150" />
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-300" />
                </div>
              </div>
            </div>
            
            <span className="text-xs font-black">More</span>
            
            {/* Active Indicator */}
            {showMore && (
              <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>
      
      {/* Bottom Safe Area for iOS */}
      <div className="h-1 bg-white" />
    </div>
  );
}; 