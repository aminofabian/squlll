'use client'

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Timer, 
  Clock, 
  Users, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Save, 
  Upload, 
  RefreshCw, 
  ChevronDown,
  ArrowLeft,
  Play,
  Pause
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTimetableStore, type CellData } from '@/lib/stores/useTimetableStore';

// Type definitions
interface StudentLesson {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  day: string;
  period: number;
  isBreak?: boolean;
  breakType?: string;
  completed?: boolean;
}

interface NextLessonInfo {
  lesson: StudentLesson;
  startsIn: number;
  time: string;
  nextDay?: boolean;
  period: string;
  periodIndex: number;
  minutesUntil: number;
}

interface StudentStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  totalSubjects: number;
  subjectDistribution: Record<string, number>;
  dayDistribution: Record<string, number>;
  teacherDistribution: Record<string, number>;
}

interface StudentTimetableData {
  schedule: Record<string, (StudentLesson | null)[]>;
  periods: string[];
  stats: StudentStats;
}

interface StudentTimetableComponentProps {
  onBack: () => void;
}

const StudentTimetableComponent = ({ onBack }: StudentTimetableComponentProps) => {
  // Use shared store
  const { 
    mainTimetable, 
    updateMainTimetable,
    loadMockData,
    forceReloadMockData
  } = useTimetableStore();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showNextLesson, setShowNextLesson] = useState(false);
  const [timetableData, setTimetableData] = useState<StudentTimetableData>({
    schedule: {
      "MONDAY": Array(11).fill(null),
      "TUESDAY": Array(11).fill(null),
      "WEDNESDAY": Array(11).fill(null),
      "THURSDAY": Array(11).fill(null),
      "FRIDAY": Array(11).fill(null)
    },
    periods: mainTimetable.timeSlots.map(slot => slot.time),
    stats: {
      totalLessons: 0,
      completedLessons: 0,
      upcomingLessons: 0,
      totalSubjects: 0,
      subjectDistribution: {},
      dayDistribution: {},
      teacherDistribution: {}
    }
  });

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

  // Filter timetable data by selected grade
  const filterTimetableByGrade = (grade: string) => {
    const filteredSchedule: Record<string, (StudentLesson | null)[]> = {
      "MONDAY": Array(11).fill(null),
      "TUESDAY": Array(11).fill(null),
      "WEDNESDAY": Array(11).fill(null),
      "THURSDAY": Array(11).fill(null),
      "FRIDAY": Array(11).fill(null)
    };

    const subjectDistribution: Record<string, number> = {};
    const dayDistribution: Record<string, number> = {};
    const teacherDistribution: Record<string, number> = {};

    let totalLessons = 0;
    let completedCount = 0;
    let upcomingCount = 0;

    // Filter main timetable data for the selected grade
    Object.entries(mainTimetable.subjects).forEach(([cellKey, cellData]) => {
      const [cellGrade, dayIndex, timeId] = cellKey.split('-');
      
      if (cellGrade === grade && cellData) {
        const dayName = weekDays[parseInt(dayIndex) - 1];
        const periodIndex = parseInt(timeId);
        
        if (dayName && periodIndex >= 0 && periodIndex < 11) {
          const lesson: StudentLesson = {
            id: `${dayName.toLowerCase()}-${periodIndex + 1}`,
            subject: cellData.subject,
            teacher: cellData.teacher || '',
            room: `Room ${Math.floor(Math.random() * 20) + 1}`,
            day: dayName,
            period: periodIndex + 1,
            isBreak: cellData.isBreak || false,
            breakType: cellData.breakType || undefined,
            completed: completedLessons.includes(`${dayName.toLowerCase()}-${periodIndex + 1}`)
          };

          filteredSchedule[dayName][periodIndex] = lesson;
          
          if (!cellData.isBreak) {
            totalLessons++;
            
            subjectDistribution[cellData.subject] = (subjectDistribution[cellData.subject] || 0) + 1;
            dayDistribution[dayName] = (dayDistribution[dayName] || 0) + 1;
            
            if (cellData.teacher) {
              teacherDistribution[cellData.teacher] = (teacherDistribution[cellData.teacher] || 0) + 1;
            }
            
            if (lesson.completed) {
              completedCount++;
            } else {
              upcomingCount++;
            }
          }
        }
      }
    });

    return {
      schedule: filteredSchedule,
      periods: mainTimetable.timeSlots.map(slot => slot.time),
      stats: {
        totalLessons,
        completedLessons: completedCount,
        upcomingLessons: upcomingCount,
        totalSubjects: Object.keys(subjectDistribution).length,
        subjectDistribution,
        dayDistribution,
        teacherDistribution
      }
    };
  };

  // Force reload mock data when component mounts
  useEffect(() => {
    forceReloadMockData();
  }, [forceReloadMockData]);

  // Sync with store changes and filter by selected grade
  useEffect(() => {
    const filteredData = filterTimetableByGrade(selectedGrade);
    setTimetableData(filteredData);
  }, [mainTimetable, selectedGrade, completedLessons]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions
  const parseTimeSlot = (timeSlotStr: string): { start: number, end: number } => {
    // Parse time slot like "7:30 AM – 8:15 AM"
    const parts = timeSlotStr.split(' – ');
    const startTime = parts[0]; // "7:30 AM"
    const endTime = parts[1];   // "8:15 AM"
    
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

  const formatTimeUntil = (minutesUntil: number): string => {
    if (minutesUntil < 60) {
      return `${minutesUntil}m`;
    } else {
      const hours = Math.floor(minutesUntil / 60);
      const minutes = minutesUntil % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const getCurrentPeriod = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (let i = 0; i < timetableData.periods.length; i++) {
      const timeSlot = parseTimeSlot(timetableData.periods[i]);

      if (currentTimeInMinutes >= timeSlot.start && currentTimeInMinutes < timeSlot.end) {
        return i;
      }
    }
    return -1;
  };

  const getCurrentDay = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = days[currentTime.getDay()];
    return currentDay;
  };

  const getCurrentLesson = () => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod === -1 || !weekDays.includes(currentDay)) {
      return null;
    }
    
    const lesson = timetableData.schedule[currentDay]?.[currentPeriod];
    return lesson || null;
  };

  const getRemainingMinutes = () => {
    const currentPeriod = getCurrentPeriod();
    if (currentPeriod === -1) return 0;
    
    const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const timeSlot = parseTimeSlot(timetableData.periods[currentPeriod]);
    
    const remaining = timeSlot.end - currentTimeInMinutes;
    return remaining;
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
    
    const currentLesson = timetableData.schedule[currentDay]?.[currentPeriod];
    
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

  const getNextLesson = (): NextLessonInfo | null => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod === -1) return null;

    // Check remaining periods today
    for (let periodIndex = currentPeriod + 1; periodIndex < timetableData.periods.length; periodIndex++) {
      const lesson = timetableData.schedule[currentDay]?.[periodIndex];
      if (lesson && !lesson.isBreak) {
        const periodTime = parseTimeSlot(timetableData.periods[periodIndex]);
        const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const minutesUntil = periodTime.start - currentTimeInMinutes;
        
        return {
          lesson,
          startsIn: periodTime.start,
          time: timetableData.periods[periodIndex],
          nextDay: false,
          period: `Period ${periodIndex + 1}`,
          periodIndex,
          minutesUntil
        };
      }
    }

    // Check next day
    const dayIndex = weekDays.indexOf(currentDay);
    if (dayIndex !== -1) {
      for (let nextDayIndex = dayIndex + 1; nextDayIndex < weekDays.length; nextDayIndex++) {
        const nextDay = weekDays[nextDayIndex];
        for (let periodIndex = 0; periodIndex < timetableData.periods.length; periodIndex++) {
          const lesson = timetableData.schedule[nextDay]?.[periodIndex];
          if (lesson && !lesson.isBreak) {
            const periodTime = parseTimeSlot(timetableData.periods[periodIndex]);
            const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
            const minutesUntil = (24 * 60 - currentTimeInMinutes) + periodTime.start;
            
            return {
              lesson,
              startsIn: periodTime.start,
              time: timetableData.periods[periodIndex],
              nextDay: true,
              period: `Period ${periodIndex + 1}`,
              periodIndex,
              minutesUntil
            };
          }
        }
      }
    }

    return null;
  };

  const getLessonStyles = (lesson: StudentLesson | null, periodIndex: number, day: string) => {
    if (!lesson) return '';
    
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex;
    const isCompleted = lesson.completed;
    const isBreak = lesson.isBreak;
    
    if (isBreak) {
      // Creative break styling with different patterns based on break type
      if (lesson.breakType === 'lunch') {
        return 'bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 text-primary-dark shadow-sm';
      } else if (lesson.breakType === 'recess') {
        return 'bg-gradient-to-br from-primary/8 to-primary/15 border-2 border-primary/40 text-primary-dark shadow-sm';
      } else {
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 shadow-sm';
      }
    }
    
    if (isCurrentLesson) {
      return 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg border-2 border-primary/30 ring-2 ring-primary/20';
    }
    
    if (isCompleted) {
      return 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-700 shadow-sm';
    }
    
    // Regular lesson with enhanced borders
    return 'bg-white border-2 border-gray-200 hover:border-primary/40 hover:shadow-md transition-all duration-200';
  };

  const renderLessonIndicators = (lesson: StudentLesson, periodIndex: number, day: string) => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex;
    const isCompleted = lesson.completed;
    const isBreak = lesson.isBreak;
    
    return (
      <div className="flex items-center gap-1 mt-2">
        {isCurrentLesson && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white animate-pulse"></div>
            <span className="text-xs font-medium text-white">Now</span>
          </div>
        )}
        {isCompleted && !isBreak && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className={`w-3 h-3 ${isCurrentLesson ? 'text-white/80' : 'text-gray-600'}`} />
            <span className={`text-xs font-medium ${isCurrentLesson ? 'text-white/90' : 'text-gray-600'}`}>Done</span>
          </div>
        )}
        {isBreak && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 animate-bounce" 
                 style={{
                   backgroundColor: lesson.breakType === 'lunch' ? '#246a59' : 
                                  lesson.breakType === 'recess' ? '#2d8570' : '#6b7280'
                 }}>
            </div>
            <span className={`text-xs font-medium ${isCurrentLesson ? 'text-white/90' : 'text-gray-600'}`}>
              {lesson.breakType === 'lunch' ? 'Lunch' : 
               lesson.breakType === 'recess' ? 'Recess' : 'Break'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      forceReloadMockData();
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = timetableData.stats;
  const currentLesson = getCurrentLesson();
  const nextLesson = getNextLesson();
  const remainingMinutes = getRemainingMinutes();
  const currentStatus = getCurrentLessonStatus();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Academic Schedule
            </h1>
            <p className="text-gray-600 font-medium">
              {selectedGrade} • Weekly Timetable
            </p>
          </div>
        </div>
        
        {/* Grade Selector */}
        <div className="relative">
          <button
            onClick={() => setShowGradeDropdown(!showGradeDropdown)}
            className="flex items-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{selectedGrade}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showGradeDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-xl z-50 min-w-[200px]">
              {grades.map((grade) => (
                <div
                  key={grade}
                  onClick={() => {
                    setSelectedGrade(grade);
                    setShowGradeDropdown(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedGrade === grade ? 'bg-primary text-white' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Statistics</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">This week</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-gray-600" />
                    </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedLessons}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%
                  </div>
                  <div className="flex-1 bg-gray-200 h-1.5">
                    <div 
                      className="bg-primary h-1.5 transition-all duration-300" 
                      style={{ width: `${stats.totalLessons > 0 ? (stats.completedLessons / stats.totalLessons) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingLessons}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Remaining this week</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                    </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subjects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Different subjects</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Current Status Banner */}
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

      {/* Next Lesson Panel */}
      {nextLesson && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Next Lesson</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNextLesson(!showNextLesson)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              {showNextLesson ? 'Hide Next Lesson' : 'Show Next Lesson'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showNextLesson ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {showNextLesson && (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">
                      {nextLesson.lesson.subject} • {nextLesson.lesson.teacher}
                    </p>
                    <p className="text-sm text-gray-600">
                      {nextLesson.nextDay ? 'Tomorrow' : 'Today'} • {nextLesson.time} • Room {nextLesson.lesson.room}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatTimeUntil(nextLesson.minutesUntil)}
                    </div>
                    <div className="text-sm text-gray-500">Until next lesson</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Timetable Grid */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="p-4 text-left font-bold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>Time</span>
                    </div>
                  </th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-4 text-center font-bold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200 last:border-r-0">
                      <div className="flex flex-col items-center gap-1">
                        <span>{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                        <div className="w-8 h-0.5 bg-primary"></div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetableData.periods.map((period, periodIndex) => (
                  <tr key={periodIndex} className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
                    <td className="p-4 text-sm font-semibold text-gray-700 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary"></div>
                        <span>{period}</span>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const lesson = timetableData.schedule[day][periodIndex];
                      const isCurrentLesson = day === getCurrentDay() && periodIndex === getCurrentPeriod();
                      return (
                        <td key={day} className="p-3 border-r border-gray-100 last:border-r-0">
                          {lesson ? (
                            <div className={`p-4 border-2 transition-all duration-300 transform hover:scale-[1.02] ${getLessonStyles(lesson, periodIndex, day)}`}>
                              <div className="font-bold text-sm mb-3">
                                {lesson.isBreak ? (
                                  <span className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {lesson.breakType === 'lunch' && '🍽️'}
                                      {lesson.breakType === 'recess' && '🏃'}
                                      {lesson.breakType === 'break' && '☕'}
                                    </span>
                                    <span className={isCurrentLesson ? 'text-white' : 'text-gray-700'}>{lesson.subject}</span>
                                  </span>
                                ) : (
                                  <span className={isCurrentLesson ? 'text-white' : 'text-gray-900'}>{lesson.subject}</span>
                                )}
                              </div>
                              {!lesson.isBreak && (
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Users className={`w-3 h-3 ${isCurrentLesson ? 'text-white/80' : 'text-gray-500'}`} />
                                    <span className={`text-xs font-medium ${isCurrentLesson ? 'text-white/90' : 'text-gray-600'}`}>
                                      {lesson.teacher}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className={`w-3 h-3 ${isCurrentLesson ? 'text-white/80' : 'text-gray-500'}`} />
                                    <span className={`text-xs ${isCurrentLesson ? 'text-white/80' : 'text-gray-500'}`}>
                                      Room {lesson.room}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {renderLessonIndicators(lesson, periodIndex, day)}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 bg-gray-50/50">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-6 h-6 border-2 border-gray-300 border-dashed"></div>
                                <span>Free Period</span>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={forceReloadMockData}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Mock Data
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Timetable'}
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
            <div className="w-2 h-2 bg-green-500 mr-2"></div>
            Timetable Synced
          </Badge>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetableComponent; 