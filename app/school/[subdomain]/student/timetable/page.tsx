'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Timer, Clock, Users, MapPin, BookOpen, Calendar, Save, Upload, RefreshCw, ChevronDown } from 'lucide-react';
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

const StudentTimetable = () => {
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
        const dayName = weekDays[parseInt(dayIndex) - 1]; // Convert 1-based day to 0-based index
        const periodIndex = parseInt(timeId); // Keep 0-based time slot
        
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
            
            // Subject distribution
            subjectDistribution[cellData.subject] = (subjectDistribution[cellData.subject] || 0) + 1;
            
            // Day distribution
            dayDistribution[dayName] = (dayDistribution[dayName] || 0) + 1;
            
            // Teacher distribution
            if (cellData.teacher) {
              teacherDistribution[cellData.teacher] = (teacherDistribution[cellData.teacher] || 0) + 1;
            }
            
            // Completed/upcoming count
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
    console.log('Student timetable data updated:', mainTimetable);
    console.log('Main timetable subjects count:', Object.keys(mainTimetable.subjects).length);
    console.log('Breaks in main timetable:', Object.entries(mainTimetable.subjects).filter(([key, data]) => data?.isBreak).length);
    
    const filteredData = filterTimetableByGrade(selectedGrade);
    console.log('Filtered data for grade:', selectedGrade, filteredData);
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
      return `${minutesUntil} min`;
    }
    const hours = Math.floor(minutesUntil / 60);
    const minutes = minutesUntil % 60;
    return `${hours}h ${minutes}m`;
  };

  const getCurrentPeriod = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const periodTimes = [
      { start: parseTime("8:00"), end: parseTime("8:45") },
      { start: parseTime("8:50"), end: parseTime("9:35") },
      { start: parseTime("9:40"), end: parseTime("10:25") },
      { start: parseTime("10:45"), end: parseTime("11:30") },
      { start: parseTime("11:35"), end: parseTime("12:20") },
      { start: parseTime("13:15"), end: parseTime("14:00") },
      { start: parseTime("14:05"), end: parseTime("14:50") }
    ];

    for (let i = 0; i < periodTimes.length; i++) {
      if (currentTimeMinutes >= periodTimes[i].start && currentTimeMinutes <= periodTimes[i].end) {
        return i + 1;
      }
    }
    return null;
  };

  const getCurrentDay = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[currentTime.getDay()];
  };

  const getNextLesson = (): NextLessonInfo | null => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (!currentDay || currentDay === 'SUNDAY' || currentDay === 'SATURDAY') {
      return null;
    }

    const daySchedule = timetableData.schedule[currentDay];
    if (!daySchedule) return null;

    let nextLessonIndex = -1;
    let nextDay = false;

    if (currentPeriod) {
      // Find next lesson today
      for (let i = currentPeriod; i < daySchedule.length; i++) {
        if (daySchedule[i] && !daySchedule[i]?.isBreak) {
          nextLessonIndex = i;
          break;
        }
      }
    } else {
      // Find first lesson today
      for (let i = 0; i < daySchedule.length; i++) {
        if (daySchedule[i] && !daySchedule[i]?.isBreak) {
          nextLessonIndex = i;
          break;
        }
      }
    }

    if (nextLessonIndex === -1) {
      // Find first lesson tomorrow
      const tomorrowIndex = weekDays.indexOf(currentDay) + 1;
      if (tomorrowIndex < weekDays.length) {
        const tomorrowDay = weekDays[tomorrowIndex];
        const tomorrowSchedule = timetableData.schedule[tomorrowDay];
        if (tomorrowSchedule) {
          for (let i = 0; i < tomorrowSchedule.length; i++) {
            if (tomorrowSchedule[i] && !tomorrowSchedule[i]?.isBreak) {
              nextLessonIndex = i;
              nextDay = true;
              break;
            }
          }
        }
      }
    }

    if (nextLessonIndex === -1) return null;

    const lesson = nextDay 
      ? timetableData.schedule[weekDays[weekDays.indexOf(currentDay) + 1]]?.[nextLessonIndex]
      : daySchedule[nextLessonIndex];

    if (!lesson) return null;

    const periodTime = timetableData.periods[nextLessonIndex];
    const [startTime] = periodTime.split(' – ');
    const [hours, minutes] = startTime.split(':').map(Number);
    const lessonStartTime = new Date();
    lessonStartTime.setHours(hours, minutes, 0, 0);

    if (nextDay) {
      lessonStartTime.setDate(lessonStartTime.getDate() + 1);
    }

    const minutesUntil = Math.floor((lessonStartTime.getTime() - currentTime.getTime()) / (1000 * 60));

    return {
      lesson,
      startsIn: minutesUntil,
      time: periodTime,
      nextDay,
      period: `Period ${nextLessonIndex + 1}`,
      periodIndex: nextLessonIndex,
      minutesUntil
    };
  };

  const getCurrentLesson = () => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    if (!currentDay || currentDay === 'SUNDAY' || currentDay === 'SATURDAY' || !currentPeriod) {
      return null;
    }

    const daySchedule = timetableData.schedule[currentDay];
    if (!daySchedule) return null;

    const lesson = daySchedule[currentPeriod - 1];
    return lesson && !lesson.isBreak ? lesson : null;
  };

  const getRemainingMinutes = () => {
    const currentLesson = getCurrentLesson();
    if (!currentLesson) return 0;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const periodTime = timetableData.periods[currentLesson.period - 1];
    const [, endTime] = periodTime.split(' – ');
    const [hours, minutes] = endTime.split(':').map(Number);
    const lessonEndTime = hours * 60 + minutes;

    return Math.max(0, lessonEndTime - currentTimeMinutes);
  };

  const getLessonStyles = (lesson: StudentLesson | null, periodIndex: number, day: string) => {
    if (!lesson) return 'bg-gray-50 hover:bg-gray-100';

    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex + 1;
    const isCompleted = completedLessons.includes(lesson.id);

    let baseStyles = 'border-l-4 transition-all duration-200 hover:shadow-md';

    if (lesson.isBreak) {
      if (lesson.breakType === 'lunch') {
        baseStyles += ' bg-orange-50 border-l-orange-500';
      } else if (lesson.breakType === 'recess') {
        baseStyles += ' bg-green-50 border-l-green-500';
      } else {
        baseStyles += ' bg-blue-50 border-l-blue-500';
      }
    } else {
      if (isCurrentLesson) {
        baseStyles += ' bg-primary/10 border-l-primary shadow-lg';
      } else if (isCompleted) {
        baseStyles += ' bg-green-50 border-l-green-500';
      } else {
        baseStyles += ' bg-white border-l-gray-300';
      }
    }

    return baseStyles;
  };

  const renderLessonIndicators = (lesson: StudentLesson, periodIndex: number, day: string) => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex + 1;
    const isCompleted = completedLessons.includes(lesson.id);

    return (
      <div className="flex items-center justify-between">
        {isCurrentLesson && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-primary font-medium">Now</span>
          </div>
        )}
        {isCompleted && !isCurrentLesson && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600">Done</span>
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
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Student timetable synced with main timetable');
    } catch (error) {
      console.error('Error syncing student timetable:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveStudentTimetable = () => {
    const studentTimetableData = {
      timetable: {} as Record<string, { subject: string; teacher: string; isBreak?: boolean; breakType?: string }>,
      metadata: {
        grade: selectedGrade,
        timeSlots: mainTimetable.timeSlots,
        stats: timetableData.stats,
        lastSaved: new Date().toISOString()
      }
    };

    // Convert student schedule to the main timetable format
    Object.entries(timetableData.schedule).forEach(([day, lessons]) => {
      lessons.forEach((lesson, periodIndex) => {
        if (lesson) {
          const cellKey = `${selectedGrade}-${periodIndex + 1}-${weekDays.indexOf(day)}`;
          studentTimetableData.timetable[cellKey] = {
            subject: lesson.subject,
            teacher: lesson.teacher,
            isBreak: lesson.isBreak || false,
            breakType: lesson.breakType || undefined
          };
        }
      });
    });

    // Create and download the JSON file
    const dataStr = JSON.stringify(studentTimetableData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-timetable-${selectedGrade}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Student timetable for ${selectedGrade} saved successfully!`);
  };

  const handleLoadStudentTimetable = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            if (data.timetable && data.metadata) {
              // Convert the main timetable format back to student schedule format
              const newSchedule: Record<string, (StudentLesson | null)[]> = {
                "MONDAY": Array(11).fill(null),
                "TUESDAY": Array(11).fill(null),
                "WEDNESDAY": Array(11).fill(null),
                "THURSDAY": Array(11).fill(null),
                "FRIDAY": Array(11).fill(null)
              };
              
              Object.entries(data.timetable).forEach(([cellKey, cellData]: [string, any]) => {
                const [grade, dayIndex, timeId] = cellKey.split('-');
                const dayName = weekDays[parseInt(dayIndex) - 1]; // Convert 1-based day to 0-based index
                const periodIndex = parseInt(timeId); // Keep 0-based time slot
                
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
                    completed: false
                  };
                  
                  newSchedule[dayName][periodIndex] = lesson;
                }
              });

              // Update state
              setTimetableData(prev => ({
                ...prev,
                schedule: newSchedule
              }));
              
              if (data.metadata.grade) {
                setSelectedGrade(data.metadata.grade);
              }

              alert(`Student timetable loaded successfully!`);
            } else {
              alert('Invalid student timetable file format.');
            }
          } catch (error) {
            alert('Error loading student timetable file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const stats = timetableData.stats;
  const currentLesson = getCurrentLesson();
  const nextLesson = getNextLesson();
  const remainingMinutes = getRemainingMinutes();

  return (
    <div className="container py-8 mx-auto max-w-6xl">
      {/* Header with Grade Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#246a59] mb-2">Student Timetable - {selectedGrade}</h1>
          <p className="text-slate-600">View your class schedule and upcoming lessons</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowGradeDropdown(!showGradeDropdown)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">{selectedGrade}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showGradeDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px]">
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
          <Button 
            variant="outline"
            onClick={forceReloadMockData}
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Mock Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLessons}</div>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.completedLessons}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-slate-500">
                {stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%
              </div>
              <div className="flex-1 bg-slate-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full" 
                  style={{ width: `${stats.totalLessons > 0 ? (stats.completedLessons / stats.totalLessons) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.upcomingLessons}</div>
            <p className="text-xs text-slate-500 mt-1">Remaining this week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalSubjects}</div>
            <p className="text-xs text-slate-500 mt-1">Different subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Lesson Banner */}
      {currentLesson && (
        <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Current Lesson</h3>
                <p className="text-sm text-slate-600">
                  {currentLesson.subject} with {currentLesson.teacher} • Room {currentLesson.room}
                </p>
                <p className="text-xs text-slate-500">
                  {remainingMinutes} minutes remaining
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{formatCurrentTime(currentTime)}</div>
                <div className="text-xs text-slate-500">Current Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Lesson Panel */}
      {nextLesson && (
        <Card className="mb-6 border-l-4 border-l-amber-500 bg-amber-50">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left font-medium text-slate-600 bg-gray-50">Time</th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-3 text-center font-medium text-slate-600 bg-gray-50">
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetableData.periods.map((period, periodIndex) => (
                  <tr key={periodIndex} className="border-b border-gray-100">
                    <td className="p-3 text-sm text-slate-500 bg-gray-50 font-medium">
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
                                  <div className="text-xs text-slate-600 mt-1">
                                    {lesson.teacher}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Room {lesson.room}
                                  </div>
                                </>
                              )}
                              {renderLessonIndicators(lesson, periodIndex, day)}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-slate-400 text-sm">
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
      <div className="flex gap-3 mt-6">
        <Button 
          variant="outline"
          onClick={handleLoadStudentTimetable}
          className="border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Load Timetable
        </Button>
        <Button 
          variant="outline"
          onClick={handleSaveStudentTimetable}
          className="border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/10"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Timetable
        </Button>
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="bg-[#246a59] hover:bg-[#1a4d3f] text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync with Main Timetable'}
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mt-6">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Timetable Synced
        </Badge>
        <span className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default StudentTimetable;