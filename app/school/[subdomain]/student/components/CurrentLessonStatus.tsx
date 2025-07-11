'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTimetableStore } from '@/lib/stores/useTimetableStore';

interface CurrentLessonStatusProps {
  selectedGrade?: string;
}

const CurrentLessonStatus = ({ selectedGrade = 'Grade 1' }: CurrentLessonStatusProps) => {
  const { mainTimetable } = useTimetableStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  // Helper functions
  const parseTimeSlot = (timeSlotStr: string): { start: number, end: number } => {
    const parts = timeSlotStr.split(' – ');
    const startTime = parts[0];
    const endTime = parts[1];
    
    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let totalHours = hours;
      if (period === 'PM' && hours !== 12) {
        totalHours += 12;
      } else if (period === 'AM' && hours === 12) {
        totalHours = 0;
      }
      
      return totalHours * 60 + minutes;
    };
    
    return {
      start: parseTime(startTime),
      end: parseTime(endTime)
    };
  };

  const getCurrentPeriod = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (let i = 0; i < mainTimetable.timeSlots.length; i++) {
      const timeSlot = parseTimeSlot(mainTimetable.timeSlots[i].time);

      if (currentTimeInMinutes >= timeSlot.start && currentTimeInMinutes < timeSlot.end) {
        return i;
      }
    }
    return -1;
  };

  const getCurrentDay = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[currentTime.getDay()];
  };

  const getCurrentLesson = () => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod === -1 || !weekDays.includes(currentDay)) {
      return null;
    }
    
    // Find the lesson for the current grade, day, and period
    const cellKey = `${selectedGrade}-${weekDays.indexOf(currentDay) + 1}-${currentPeriod}`;
    const cellData = mainTimetable.subjects[cellKey];
    
    if (!cellData) return null;
    
    return {
      subject: cellData.subject,
      teacher: cellData.teacher || '',
      room: `Room ${Math.floor(Math.random() * 20) + 1}`,
      isBreak: cellData.isBreak || false,
      breakType: cellData.breakType || undefined
    };
  };

  const getRemainingMinutes = () => {
    const currentPeriod = getCurrentPeriod();
    if (currentPeriod === -1) return 0;
    
    const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const timeSlot = parseTimeSlot(mainTimetable.timeSlots[currentPeriod].time);
    
    return timeSlot.end - currentTimeInMinutes;
  };

  const getCurrentLessonStatus = () => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod === -1) {
      return { status: 'outside', message: 'Outside school hours' };
    }
    
    if (!weekDays.includes(currentDay)) {
      return { status: 'weekend', message: 'Weekend - No classes' };
    }
    
    const currentLesson = getCurrentLesson();
    
    if (!currentLesson) {
      return { status: 'free', message: 'Free period' };
    }
    
    if (currentLesson.isBreak) {
      return { 
        status: 'break', 
        message: `${currentLesson.breakType === 'lunch' ? 'Lunch' : currentLesson.breakType === 'recess' ? 'Recess' : 'Break'} time`,
        lesson: currentLesson
      };
    }
    
    return { 
      status: 'lesson', 
      message: 'Current lesson in progress',
      lesson: currentLesson
    };
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentStatus = getCurrentLessonStatus();
  const remainingMinutes = getRemainingMinutes();

  return (
    <Card className={`bg-white border-l-4 shadow-sm ${
      currentStatus.status === 'lesson' ? 'border-l-primary' :
      currentStatus.status === 'break' ? 'border-l-primary/60' :
      currentStatus.status === 'free' ? 'border-l-gray-400' :
      'border-l-gray-300'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 animate-pulse ${
                currentStatus.status === 'lesson' ? 'bg-primary' :
                currentStatus.status === 'break' ? 'bg-primary/60' :
                currentStatus.status === 'free' ? 'bg-gray-400' :
                'bg-gray-300'
              }`}></div>
              <h3 className="font-bold text-gray-900 text-lg">
                {currentStatus.status === 'lesson' ? 'Current Lesson' :
                 currentStatus.status === 'break' ? 'Current Break' :
                 currentStatus.status === 'free' ? 'Free Period' :
                 currentStatus.status === 'weekend' ? 'Weekend' :
                 'Outside School Hours'}
              </h3>
            </div>
            
            {currentStatus.status === 'lesson' && currentStatus.lesson && (
              <>
                <p className="text-gray-700 font-semibold text-base">
                  {currentStatus.lesson.subject} • {currentStatus.lesson.teacher}
                </p>
                <p className="text-sm text-gray-600">
                  Room {currentStatus.lesson.room} • {remainingMinutes} minutes remaining
                </p>
              </>
            )}
            
            {currentStatus.status === 'break' && currentStatus.lesson && (
              <>
                <p className="text-gray-700 font-semibold text-base">
                  {currentStatus.lesson.breakType === 'lunch' ? '🍽️ Lunch Time' :
                   currentStatus.lesson.breakType === 'recess' ? '🏃 Recess Time' :
                   '☕ Break Time'}
                </p>
                <p className="text-sm text-gray-600">
                  {remainingMinutes} minutes remaining
                </p>
              </>
            )}
            
            {currentStatus.status === 'free' && (
              <p className="text-gray-700 font-semibold text-base">
                Free period • {remainingMinutes} minutes remaining
              </p>
            )}
            
            {currentStatus.status === 'weekend' && (
              <p className="text-gray-700 font-semibold text-base">
                No classes scheduled for today
              </p>
            )}
            
            {currentStatus.status === 'outside' && (
              <p className="text-gray-700 font-semibold text-base">
                School is currently closed
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{formatCurrentTime(currentTime)}</div>
            <div className="text-sm text-gray-500">Current Time</div>
            <div className="text-xs text-gray-400 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentLessonStatus; 