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
      // eslint-disable-next-line react-hooks/purity -- placeholder room number until real room data is wired up
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

  const accentBar =
    currentStatus.status === 'lesson' ? 'border-l-primary'
    : currentStatus.status === 'break' ? 'border-l-primary/60'
    : currentStatus.status === 'free' ? 'border-l-muted-foreground/50'
    : 'border-l-border';

  const statusDot =
    currentStatus.status === 'lesson' ? 'bg-primary'
    : currentStatus.status === 'break' ? 'bg-primary/60'
    : currentStatus.status === 'free' ? 'bg-muted-foreground/50'
    : 'bg-border';

  const statusTitle =
    currentStatus.status === 'lesson' ? 'Current Lesson'
    : currentStatus.status === 'break' ? 'Current Break'
    : currentStatus.status === 'free' ? 'Free Period'
    : currentStatus.status === 'weekend' ? 'Weekend'
    : 'Outside School Hours';

  return (
    <Card className={`border-l-4 bg-card shadow-sm ${accentBar}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot}`} />
              <h3 className="text-sm font-semibold text-foreground">{statusTitle}</h3>
            </div>

            {currentStatus.status === 'lesson' && currentStatus.lesson && (
              <>
                <p className="text-sm font-medium text-foreground">
                  {currentStatus.lesson.subject} • {currentStatus.lesson.teacher}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentStatus.lesson.room} • {remainingMinutes} minutes remaining
                </p>
              </>
            )}

            {currentStatus.status === 'break' && currentStatus.lesson && (
              <>
                <p className="text-sm font-medium text-foreground">
                  {currentStatus.lesson.breakType === 'lunch' ? 'Lunch break' :
                   currentStatus.lesson.breakType === 'recess' ? 'Recess' :
                   'Break'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {remainingMinutes} minutes remaining
                </p>
              </>
            )}

            {currentStatus.status === 'free' && (
              <p className="text-sm font-medium text-foreground">
                Free period • {remainingMinutes} minutes remaining
              </p>
            )}

            {currentStatus.status === 'weekend' && (
              <p className="text-sm font-medium text-foreground">
                No classes scheduled for today
              </p>
            )}

            {currentStatus.status === 'outside' && (
              <p className="text-sm font-medium text-foreground">
                School is currently closed
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <div className="text-2xl font-semibold tracking-tight text-foreground">{formatCurrentTime(currentTime)}</div>
            <div className="text-xs text-muted-foreground">Current Time</div>
            <div className="mt-1 text-xs text-muted-foreground">
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
