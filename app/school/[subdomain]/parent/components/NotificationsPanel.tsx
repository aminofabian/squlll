'use client'

import React from 'react';
import { Bell, ChevronLeft } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
}

export const NotificationsPanel = ({ 
  notifications, 
  isOpen = false, 
  onClose, 
  variant = 'desktop' 
}: NotificationsPanelProps) => {
  if (variant === 'mobile') {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md rounded-t-3xl p-6 max-h-96 overflow-y-auto border-t border-border/50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-card-foreground">Notifications</h2>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group"
            >
              <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                notification.read 
                  ? 'bg-muted/30 border-border hover:bg-muted/50' 
                  : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${notification.read ? 'bg-muted-foreground' : 'bg-primary animate-pulse'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-card-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2 font-medium">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card/90 backdrop-blur-sm shadow-2xl border-l border-border/50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-card-foreground">Notifications</h2>
          <Bell className="w-6 h-6 text-muted-foreground animate-pulse" />
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-105 ${
            notification.read 
              ? 'bg-muted/30 border-border hover:bg-muted/50' 
              : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
          }`}>
            <div className="flex items-start space-x-4">
              <div className={`w-3 h-3 rounded-full mt-2 ${notification.read ? 'bg-muted-foreground' : 'bg-primary animate-pulse'}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-card-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2 font-medium">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-border/50">
        <button className="w-full text-center text-primary hover:text-primary/80 text-sm font-black transition-colors hover:scale-105">
          View all notifications
        </button>
      </div>
    </div>
  );
}; 