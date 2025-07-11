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
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    let totalHours = hours;
    if (hours >= 1 && hours <= 7) {
      totalHours += 12;
    }
    return totalHours * 60 + minutes;
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
      const periodTime = parseTime(timetableData.periods[i]);
      const nextPeriodTime = i < timetableData.periods.length - 1 
        ? parseTime(timetableData.periods[i + 1]) 
        : periodTime + 60;

      if (currentTimeInMinutes >= periodTime && currentTimeInMinutes < nextPeriodTime) {
        return i;
      }
    }
    return -1;
  };

  const getCurrentDay = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[currentTime.getDay()];
  };

  const getNextLesson = (): NextLessonInfo | null => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod === -1) return null;

    // Check remaining periods today
    for (let periodIndex = currentPeriod + 1; periodIndex < timetableData.periods.length; periodIndex++) {
      const lesson = timetableData.schedule[currentDay]?.[periodIndex];
      if (lesson && !lesson.isBreak) {
        const periodTime = parseTime(timetableData.periods[periodIndex]);
        const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const minutesUntil = periodTime - currentTimeInMinutes;
        
        return {
          lesson,
          startsIn: periodTime,
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
            const periodTime = parseTime(timetableData.periods[periodIndex]);
            const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
            const minutesUntil = (24 * 60 - currentTimeInMinutes) + periodTime;
            
            return {
              lesson,
              startsIn: periodTime,
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

  const getCurrentLesson = () => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod === -1 || !weekDays.includes(currentDay)) return null;
    
    return timetableData.schedule[currentDay]?.[currentPeriod] || null;
  };

  const getRemainingMinutes = () => {
    const currentPeriod = getCurrentPeriod();
    if (currentPeriod === -1) return 0;
    
    const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const periodTime = parseTime(timetableData.periods[currentPeriod]);
    const nextPeriodTime = currentPeriod < timetableData.periods.length - 1 
      ? parseTime(timetableData.periods[currentPeriod + 1]) 
      : periodTime + 60;
    
    return nextPeriodTime - currentTimeInMinutes;
  };

  const getLessonStyles = (lesson: StudentLesson | null, periodIndex: number, day: string) => {
    if (!lesson) return '';
    
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex;
    const isCompleted = lesson.completed;
    const isBreak = lesson.isBreak;
    
    if (isBreak) {
      return 'bg-amber-50 border border-amber-200 text-amber-800';
    }
    
    if (isCurrentLesson) {
      return 'bg-primary text-white shadow-lg border-2 border-primary/20';
    }
    
    if (isCompleted) {
      return 'bg-green-50 border border-green-200 text-green-800';
    }
    
    return 'bg-white border border-gray-200 hover:border-primary/30 transition-colors';
  };

  const renderLessonIndicators = (lesson: StudentLesson, periodIndex: number, day: string) => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex;
    const isCompleted = lesson.completed;
    
    return (
      <div className="flex items-center gap-1 mt-2">
        {isCurrentLesson && (
          <div className="flex items-center gap-1">
            <Play className="w-3 h-3 text-primary" />
            <span className="text-xs">Now</span>
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span className="text-xs">Done</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              My Timetable
            </h2>
            <p className="text-sm text-muted-foreground/90 font-medium">
              View your class schedule and upcoming lessons
            </p>
          </div>
        </div>
        
        {/* Grade Selector */}
        <div className="relative">
          <button
            onClick={() => setShowGradeDropdown(!showGradeDropdown)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">{selectedGrade}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showGradeDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px]">
              {grades.map((grade) => (
                <div
                  key={grade}
                  onClick={() => {
                    setSelectedGrade(grade);
                    setShowGradeDropdown(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                    selectedGrade === grade ? 'bg-blue-50 text-primary' : ''
                  }`}
                >
                  <span>{grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Total Lessons</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold">Completed</span>
            </div>
            <div className="text-2xl font-bold">{stats.completedLessons}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-muted-foreground">
                {stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full" 
                  style={{ width: `${stats.totalLessons > 0 ? (stats.completedLessons / stats.totalLessons) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold">Upcoming</span>
            </div>
            <div className="text-2xl font-bold">{stats.upcomingLessons}</div>
            <p className="text-xs text-muted-foreground">Remaining this week</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold">Subjects</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">Different subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Lesson Banner */}
      {currentLesson && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Current Lesson</h3>
                <p className="text-sm text-muted-foreground">
                  {currentLesson.subject} with {currentLesson.teacher} • Room {currentLesson.room}
                </p>
                <p className="text-xs text-muted-foreground">
                  {remainingMinutes} minutes remaining
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{formatCurrentTime(currentTime)}</div>
                <div className="text-xs text-muted-foreground">Current Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Lesson Panel */}
      {nextLesson && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-800">Next Lesson</h3>
                <p className="text-sm text-amber-700">
                  {nextLesson.lesson.subject} with {nextLesson.lesson.teacher}
                </p>
                <p className="text-xs text-amber-600">
                  {nextLesson.nextDay ? 'Tomorrow' : 'Today'} • {nextLesson.time}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-800">
                  {formatTimeUntil(nextLesson.minutesUntil)}
                </div>
                <div className="text-xs text-amber-600">Until next lesson</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      <Card className="bg-card border border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left font-medium text-muted-foreground bg-muted/50">Time</th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-3 text-center font-medium text-muted-foreground bg-muted/50">
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetableData.periods.map((period, periodIndex) => (
                  <tr key={periodIndex} className="border-b border-gray-100">
                    <td className="p-3 text-sm text-muted-foreground bg-muted/50 font-medium">
                      {period}
                    </td>
                    {weekDays.map((day) => {
                      const lesson = timetableData.schedule[day][periodIndex];
                      return (
                        <td key={day} className="p-2">
                          {lesson ? (
                            <div className={`p-3 rounded-lg ${getLessonStyles(lesson, periodIndex, day)}`}>
                              <div className="font-medium text-sm">
                                {lesson.isBreak ? (
                                  <span className="flex items-center gap-1">
                                    {lesson.breakType === 'lunch' && '🍽️'}
                                    {lesson.breakType === 'recess' && '🏃'}
                                    {lesson.breakType === 'break' && '☕'}
                                    {lesson.subject}
                                  </span>
                                ) : (
                                  lesson.subject
                                )}
                              </div>
                              {!lesson.isBreak && (
                                <>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {lesson.teacher}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Room {lesson.room}
                                  </div>
                                </>
                              )}
                              {renderLessonIndicators(lesson, periodIndex, day)}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-muted-foreground text-sm">
                              Free
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
      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={forceReloadMockData}
          className="border-primary/20 text-primary hover:bg-primary/10"
        >
          <Upload className="w-4 h-4 mr-2" />
          Load Mock Data
        </Button>
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Timetable'}
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Timetable Synced
        </Badge>
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default StudentTimetableComponent; 