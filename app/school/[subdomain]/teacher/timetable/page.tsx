'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Timer, Clock } from 'lucide-react';
import {
  TeacherTimetableHeader,
  CurrentLessonBanner,
  TeacherTimetableGrid,
  NextLessonPanel,
  TimetableLegend,
  TeacherTimetableControls
} from './components';
import { useTimetableStore, type TeacherLesson } from '@/lib/stores/useTimetableStore';
import { useTeacherTimetable } from '../hooks/useTeacherTimetable';

// Type definitions
interface TimeBlock {
  start: string;
  end: string;
  period: number;
}

interface NextLessonInfo {
  lesson: TeacherLesson;
  startsIn: number;
  time: string;
  nextDay?: boolean;
  period: string;
  periodIndex: number;
  minutesUntil: number;
}

interface TeacherStats {
  totalClasses: number;
  gradeDistribution: Record<string, number>;
  totalStudents: number;
  classesPerDay: Record<string, number>;
}

interface TeacherTimetableData {
  schedule: Record<string, (TeacherLesson | null)[]>;
  breaks: Record<string, TimeBlock[]>;
  lunch: Record<string, TimeBlock[]>;
  periods: string[];
  timeSlots: Array<{
    id: string;
    periodNumber: number;
    displayTime: string;
    startTime: string;
    endTime: string;
    color: string | null;
  }>;
  breaksList: Array<{
    id: string;
    name: string;
    type: string;
    dayOfWeek: number;
    afterPeriod: number;
    durationMinutes: number;
    icon: string;
    color: string | null;
  }>;
  stats: TeacherStats;
}

const TeacherTimetable = () => {
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  
  // Fetch timetable data from GraphQL
  const { data: graphqlTimetableData, loading, error, refetch } = useTeacherTimetable(subdomain);

  // Use shared store (keeping for compatibility with existing components)
  const { 
    teacherTimetable, 
    mainTimetable,
    updateTeacherTimetable,
    syncTeacherTimetable,
    loadMockData,
    forceReloadMockData
  } = useTimetableStore();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(''); // Will be set to first available teacher
  const [timetableData, setTimetableData] = useState<TeacherTimetableData>({
    schedule: {
      "MONDAY": Array(11).fill(null),
      "TUESDAY": Array(11).fill(null),
      "WEDNESDAY": Array(11).fill(null),
      "THURSDAY": Array(11).fill(null),
      "FRIDAY": Array(11).fill(null)
    },
    breaks: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    },
    lunch: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    },
    periods: [],
    timeSlots: [],
    breaksList: [],
    stats: {
      totalClasses: 0,
      gradeDistribution: {},
      totalStudents: 0,
      classesPerDay: {
        "MONDAY": 0,
        "TUESDAY": 0,
        "WEDNESDAY": 0,
        "THURSDAY": 0,
        "FRIDAY": 0
      }
    }
  });

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  // Transform GraphQL data into the format expected by components
  const transformedTimetableData = useMemo(() => {
    if (!graphqlTimetableData) {
      return {
        schedule: {
          "MONDAY": Array(11).fill(null),
          "TUESDAY": Array(11).fill(null),
          "WEDNESDAY": Array(11).fill(null),
          "THURSDAY": Array(11).fill(null),
          "FRIDAY": Array(11).fill(null)
        },
        breaks: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: []
        },
        lunch: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: []
        },
        periods: [],
        timeSlots: [],
        breaksList: [],
        stats: {
          totalClasses: 0,
          gradeDistribution: {},
          totalStudents: 0,
          classesPerDay: {
            "MONDAY": 0,
            "TUESDAY": 0,
            "WEDNESDAY": 0,
            "THURSDAY": 0,
            "FRIDAY": 0
          }
        }
      };
    }

    // Initialize schedule with nulls
    const timeSlotsCount = graphqlTimetableData.timeSlots?.length || 11; // Default to 11 if no time slots
    const schedule: Record<string, (TeacherLesson | null)[]> = {
      "MONDAY": Array(timeSlotsCount).fill(null),
      "TUESDAY": Array(timeSlotsCount).fill(null),
      "WEDNESDAY": Array(timeSlotsCount).fill(null),
      "THURSDAY": Array(timeSlotsCount).fill(null),
      "FRIDAY": Array(timeSlotsCount).fill(null)
    };

    // Initialize breaks and lunch
    const breaks: Record<string, TimeBlock[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
    const lunch: Record<string, TimeBlock[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    // Process breaks
    const timeSlots = graphqlTimetableData.timeSlots || [];
    (graphqlTimetableData.breaks || []).forEach(breakItem => {
      const dayName = dayNames[breakItem.dayOfWeek];
      if (dayName && weekDays.includes(dayName)) {
        const timeSlot = timeSlots.find(ts => ts.periodNumber === breakItem.afterPeriod);
        if (timeSlot) {
          const breakBlock: TimeBlock = {
            start: timeSlot.startTime,
            end: timeSlot.endTime,
            period: breakItem.afterPeriod
          };
          
          if (breakItem.type === 'LUNCH') {
            lunch[dayName].push(breakBlock);
          } else {
            breaks[dayName].push(breakBlock);
          }
        }
      }
    });

    // Process entries
    const gradeDistribution: Record<string, number> = {};
    const classesPerDay: Record<string, number> = {
      "MONDAY": 0,
      "TUESDAY": 0,
      "WEDNESDAY": 0,
      "THURSDAY": 0,
      "FRIDAY": 0
    };
    let totalClasses = 0;

    // Sort time slots to ensure consistent indexing
    const sortedTimeSlots = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
    
    (graphqlTimetableData.entries || []).forEach(entry => {
      const dayName = dayNames[entry.dayOfWeek];
      if (dayName && weekDays.includes(dayName)) {
        // Find the index of this time slot in the sorted array
        const periodIndex = sortedTimeSlots.findIndex(ts => ts.id === entry.timeSlot.id);
        if (periodIndex >= 0 && periodIndex < schedule[dayName].length) {
          const lesson: TeacherLesson = {
            id: entry.id,
            subject: entry.subject.name,
            room: entry.roomNumber || 'TBA',
            class: entry.grade.name,
            grade: entry.grade.name,
            stream: '',
            day: dayName,
            period: entry.timeSlot.periodNumber,
            totalStudents: 0, // Not available in GraphQL response
            completed: false
          };

          schedule[dayName][periodIndex] = lesson;
          classesPerDay[dayName]++;
          totalClasses++;
          gradeDistribution[entry.grade.name] = (gradeDistribution[entry.grade.name] || 0) + 1;
        }
      }
    });

    // Create periods array from time slots (reuse the timeSlots variable from above)
    const periods = timeSlots.length > 0
      ? timeSlots
          .sort((a, b) => a.periodNumber - b.periodNumber)
          .map(ts => ts.displayTime)
      : [];

    return {
      schedule,
      breaks,
      lunch,
      periods,
      timeSlots: timeSlots,
      breaksList: graphqlTimetableData.breaks || [],
      stats: {
        totalClasses,
        gradeDistribution,
        totalStudents: 0, // Not available in GraphQL response
        classesPerDay
      }
    };
  }, [graphqlTimetableData]);

  // Filter timetable data by selected teacher (keeping for backward compatibility)
  const filterTimetableByTeacher = (teacherName: string) => {
    const filteredSchedule: Record<string, (TeacherLesson | null)[]> = {
      "MONDAY": Array(11).fill(null),
      "TUESDAY": Array(11).fill(null),
      "WEDNESDAY": Array(11).fill(null),
      "THURSDAY": Array(11).fill(null),
      "FRIDAY": Array(11).fill(null)
    };

    const teacherWorkload: Record<string, number> = {};
    const gradeDistribution: Record<string, number> = {};
    const classesPerDay: Record<string, number> = {
      "MONDAY": 0,
      "TUESDAY": 0,
      "WEDNESDAY": 0,
      "THURSDAY": 0,
      "FRIDAY": 0
    };

    let totalStudents = 0;
    let totalClasses = 0;

    // Filter main timetable data for the selected teacher
    Object.entries(mainTimetable.subjects).forEach(([cellKey, cellData]) => {
      if (cellData && cellData.teacher === teacherName && !cellData.isBreak) {
        const [grade, dayIndex, timeId] = cellKey.split('-');
        const dayName = weekDays[parseInt(dayIndex) - 1]; // Convert 1-based day to 0-based index
        const periodIndex = parseInt(timeId); // Keep 0-based time slot
        
        if (dayName && periodIndex >= 0 && periodIndex < 11) {
          const lesson: TeacherLesson = {
            id: `${dayName.toLowerCase()}-${periodIndex + 1}`,
            subject: cellData.subject,
            room: `Room ${Math.floor(Math.random() * 20) + 1}`,
            class: `${grade.split(' ')[1]}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
            grade: grade,
            stream: String.fromCharCode(65 + Math.floor(Math.random() * 3)),
            day: dayName,
            period: periodIndex + 1,
            totalStudents: Math.floor(Math.random() * 10) + 35,
            completed: false
          };

          filteredSchedule[dayName][periodIndex] = lesson;
          classesPerDay[dayName]++;
          totalClasses++;
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
          totalStudents += lesson.totalStudents || 0;
        }
      }
    });

    // Add breaks for the teacher
    Object.entries(mainTimetable.subjects).forEach(([cellKey, cellData]) => {
      if (cellData && cellData.isBreak) {
        const [grade, dayIndex, timeId] = cellKey.split('-');
        const dayName = weekDays[parseInt(dayIndex) - 1]; // Convert 1-based day to 0-based index
        const periodIndex = parseInt(timeId); // Keep 0-based time slot
        
        if (dayName && periodIndex >= 0 && periodIndex < 11) {
          const breakLesson: TeacherLesson = {
            id: `${dayName.toLowerCase()}-${periodIndex + 1}`,
            subject: cellData.subject,
            room: 'Break Area',
            class: 'Break',
            grade: grade,
            stream: '',
            day: dayName,
            period: periodIndex + 1,
            totalStudents: 0,
            completed: false
          };

          filteredSchedule[dayName][periodIndex] = breakLesson;
          classesPerDay[dayName]++;
          totalClasses++;
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        }
      }
    });

    return {
      schedule: filteredSchedule,
      periods: mainTimetable.timeSlots.map(slot => slot.time),
      stats: {
        totalClasses,
        gradeDistribution,
        totalStudents,
        classesPerDay
      }
    };
  };

  // Update timetable data when GraphQL data changes
  useEffect(() => {
    if (transformedTimetableData) {
      console.log('Setting timetable data:', {
        timeSlotsCount: transformedTimetableData.timeSlots.length,
        timeSlots: transformedTimetableData.timeSlots,
        breaksCount: transformedTimetableData.breaksList.length
      });
      setTimetableData(transformedTimetableData);
    }
  }, [transformedTimetableData]);

  // Debug: Log when graphqlTimetableData changes
  useEffect(() => {
    if (graphqlTimetableData) {
      console.log('GraphQL timetable data received:', {
        timeSlotsCount: graphqlTimetableData.timeSlots?.length || 0,
        timeSlots: graphqlTimetableData.timeSlots,
        entriesCount: graphqlTimetableData.entries?.length || 0,
        breaksCount: graphqlTimetableData.breaks?.length || 0
      });
    }
  }, [graphqlTimetableData]);

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
    if (!graphqlTimetableData?.timeSlots || graphqlTimetableData.timeSlots.length === 0) {
      return null;
    }

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Use actual time slots from GraphQL data
    const sortedTimeSlots = [...graphqlTimetableData.timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
    
    for (let i = 0; i < sortedTimeSlots.length; i++) {
      const slot = sortedTimeSlots[i];
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
      const startMinutesTotal = startHours * 60 + startMinutes;
      const endMinutesTotal = endHours * 60 + endMinutes;

      if (currentTimeMinutes >= startMinutesTotal && currentTimeMinutes <= endMinutesTotal) {
        return slot.periodNumber;
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

    // Create a map of period number to array index
    const sortedTimeSlots = graphqlTimetableData 
      ? [...graphqlTimetableData.timeSlots].sort((a, b) => a.periodNumber - b.periodNumber)
      : [];
    const periodToIndex = new Map<number, number>();
    sortedTimeSlots.forEach((slot, index) => {
      periodToIndex.set(slot.periodNumber, index);
    });

    let nextLessonIndex = -1;
    let nextDay = false;
    let nextPeriodNumber = 0;

    if (currentPeriod) {
      // Find the current period's index
      const currentPeriodIndex = periodToIndex.get(currentPeriod) ?? -1;
      // Find next lesson today starting from current period
      for (let i = currentPeriodIndex + 1; i < daySchedule.length; i++) {
        if (daySchedule[i]) {
          nextLessonIndex = i;
          nextPeriodNumber = sortedTimeSlots[i]?.periodNumber ?? i + 1;
          break;
        }
      }
    } else {
      // Find first lesson today
      for (let i = 0; i < daySchedule.length; i++) {
        if (daySchedule[i]) {
          nextLessonIndex = i;
          nextPeriodNumber = sortedTimeSlots[i]?.periodNumber ?? i + 1;
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
            if (tomorrowSchedule[i]) {
              nextLessonIndex = i;
              nextDay = true;
              nextPeriodNumber = sortedTimeSlots[i]?.periodNumber ?? i + 1;
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

    // Get time slot for the next lesson
    const nextTimeSlot = sortedTimeSlots[nextLessonIndex];
    
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    let minutesUntil = 0;
    
    if (nextTimeSlot) {
      const [startHours, startMinutes] = nextTimeSlot.startTime.split(':').map(Number);
      const lessonStartTime = startHours * 60 + startMinutes;
      minutesUntil = lessonStartTime - currentTimeMinutes;
    }

    return {
      lesson,
      startsIn: minutesUntil,
      time: timetableData.periods[nextLessonIndex] || `Period ${nextPeriodNumber}`,
      nextDay,
      period: timetableData.periods[nextLessonIndex] || `Period ${nextPeriodNumber}`,
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

    // Map period number to array index
    const sortedTimeSlots = graphqlTimetableData 
      ? [...graphqlTimetableData.timeSlots].sort((a, b) => a.periodNumber - b.periodNumber)
      : [];
    const periodIndex = sortedTimeSlots.findIndex(ts => ts.periodNumber === currentPeriod);
    
    if (periodIndex === -1) return null;
    return daySchedule[periodIndex] || null;
  };

  const getRemainingMinutes = () => {
    const currentPeriod = getCurrentPeriod();
    if (!currentPeriod || !graphqlTimetableData?.timeSlots) return 0;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Find the time slot for the current period
    const currentTimeSlot = graphqlTimetableData.timeSlots.find(ts => ts.periodNumber === currentPeriod);
    if (!currentTimeSlot) return 0;

    const [endHours, endMinutes] = currentTimeSlot.endTime.split(':').map(Number);
    const periodEnd = endHours * 60 + endMinutes;
    return Math.max(0, periodEnd - currentTimeMinutes);
  };

  const getLessonStyles = (lesson: TeacherLesson | null, periodIndex: number, day: string) => {
    if (!lesson) {
      return "bg-slate-50 text-slate-300 border-slate-200 hover:bg-slate-100 transition-all duration-200";
    }

    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    const isCurrentLesson = currentDay === day && currentPeriod === periodIndex + 1;
    const isCompleted = completedLessons.includes(lesson.id);

    if (isCurrentLesson) {
      return "bg-slate-100 border-slate-300 text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all duration-200";
    }

    if (isCompleted) {
      return "bg-slate-50 border-slate-200 text-slate-600 shadow-sm hover:shadow-md transition-all duration-200";
    }

    // Check if this is the next lesson
    const nextLesson = getNextLesson();
    if (nextLesson && nextLesson.lesson.id === lesson.id) {
      return "bg-slate-200 border-slate-400 text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all duration-200";
    }

    // Default lesson styling with professional monochromatic design
    return "bg-white border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200";
  };

  const renderLessonIndicators = (lesson: TeacherLesson, periodIndex: number, day: string) => {
    const indicators = [];

    // Current lesson indicator
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    if (currentDay === day && currentPeriod === periodIndex + 1) {
      indicators.push(
        <div key="current" className="flex items-center gap-0.5 text-[9px] text-slate-700 bg-slate-200 px-1 py-0.5 rounded-sm">
          <Timer className="w-2 h-2" />
          <span className="font-medium">Now</span>
        </div>
      );
    }

    // Next lesson indicator
    const nextLesson = getNextLesson();
    if (nextLesson && nextLesson.lesson.id === lesson.id) {
      indicators.push(
        <div key="next" className="flex items-center gap-0.5 text-[9px] text-slate-700 bg-slate-300 px-1 py-0.5 rounded-sm">
          <Timer className="w-2 h-2" />
          <span className="font-medium">Next</span>
        </div>
      );
    }

    return indicators;
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle sync with main timetable
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error syncing timetable:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save teacher timetable in the same format as main timetable
  const handleSaveTeacherTimetable = () => {
    // Create the teacher timetable data structure
    const teacherTimetableData = {
      timetable: {} as Record<string, { 
        subject: string; 
        teacher: string; 
        isBreak?: boolean; 
        breakType?: string 
      }>,
      metadata: {
        teacherName: selectedTeacher,
        teacherId: mainTimetable.teachers[selectedTeacher]?.id || 1,
        timeSlots: timetableData.periods.map((period, index) => ({
          id: index + 1,
          time: period,
          color: `border-l-${['primary', 'emerald-600', 'amber-500', 'sky-500', 'orange-500', 'green-600'][index % 6]}`
        })),
        breaks: [
          { id: 'lunch-1', name: 'Lunch', type: 'lunch', color: 'bg-orange-500', icon: '🍽️' },
          { id: 'recess-1', name: 'Morning Recess', type: 'recess', color: 'bg-green-500', icon: '🏃' },
          { id: 'break-1', name: 'Break', type: 'break', color: 'bg-blue-500', icon: '☕' }
        ],
        teachers: {
          [selectedTeacher]: {
            id: mainTimetable.teachers[selectedTeacher]?.id || 1,
            subjects: mainTimetable.teachers[selectedTeacher]?.subjects || ['Mathematics', 'Physics'],
            color: mainTimetable.teachers[selectedTeacher]?.color || 'bg-primary text-white'
          }
        },
        stats: timetableData.stats,
        lastSaved: new Date().toISOString()
      }
    };

    // Convert teacher schedule to the main timetable format
    Object.entries(timetableData.schedule).forEach(([day, lessons]) => {
      lessons.forEach((lesson, periodIndex) => {
        if (lesson) {
          // Create cell key in the same format as main timetable
          const cellKey = `Grade 1-${periodIndex + 1}-${weekDays.indexOf(day)}`;
          
          teacherTimetableData.timetable[cellKey] = {
            subject: lesson.subject,
            teacher: selectedTeacher,
            isBreak: false,
            breakType: undefined
          };
        }
      });
    });

    // Create and download the JSON file
    const dataStr = JSON.stringify(teacherTimetableData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-timetable-${selectedTeacher}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    alert(`Teacher timetable for ${selectedTeacher} saved successfully!`);
  };

  // Load teacher timetable from JSON file
  const handleLoadTeacherTimetable = () => {
    // Create file input element
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
              // Convert the main timetable format back to teacher schedule format
              const newSchedule: Record<string, (TeacherLesson | null)[]> = {
                "MONDAY": Array(11).fill(null),
                "TUESDAY": Array(11).fill(null),
                "WEDNESDAY": Array(11).fill(null),
                "THURSDAY": Array(11).fill(null),
                "FRIDAY": Array(11).fill(null)
              };
              
              Object.entries(data.timetable).forEach(([cellKey, cellData]: [string, any]) => {
                if (cellData && cellData.teacher === data.metadata.teacherName) {
                  const [grade, dayIndex, timeId] = cellKey.split('-');
                  const dayName = weekDays[parseInt(dayIndex) - 1]; // Convert 1-based day to 0-based index
                  const periodIndex = parseInt(timeId); // Keep 0-based time slot
                  
                  if (dayName && periodIndex >= 0 && periodIndex < 11) {
                    const lesson: TeacherLesson = {
                      id: `${dayName.toLowerCase()}-${periodIndex + 1}`,
                      subject: cellData.subject,
                      room: `Room ${Math.floor(Math.random() * 20) + 1}`,
                      class: `${grade.split(' ')[1]}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
                      grade: grade,
                      stream: String.fromCharCode(65 + Math.floor(Math.random() * 3)),
                      day: dayName,
                      period: periodIndex + 1,
                      totalStudents: Math.floor(Math.random() * 10) + 35,
                      completed: false
                    };
                    
                    newSchedule[dayName][periodIndex] = lesson;
                  }
                }
              });

              // Update state
              setTimetableData(prev => ({
                ...prev,
                schedule: newSchedule
              }));
              
              // Optionally load other data if available
              if (data.metadata.timeSlots) {
                setTimetableData(prev => ({
                  ...prev,
                  periods: data.metadata.timeSlots.map((slot: any) => slot.time)
                }));
              }
              if (data.metadata.stats) {
                setTimetableData(prev => ({
                  ...prev,
                  stats: data.metadata.stats
                }));
              }

              alert(`Teacher timetable loaded successfully!`);
            } else {
              alert('Invalid teacher timetable file format.');
            }
          } catch (error) {
            alert('Error loading teacher timetable file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Calculate stats for the controls
  const calculateStats = () => {
    let totalLessons = 0;
    let totalStudents = 0;
    let completedCount = 0;
    let upcomingCount = 0;

    Object.values(timetableData.schedule).forEach(daySchedule => {
      daySchedule.forEach(lesson => {
        if (lesson && lesson.subject !== 'Break' && lesson.subject !== 'Lunch' && lesson.class !== 'Break') {
          totalLessons++;
          totalStudents += lesson.totalStudents || 0;
          if (completedLessons.includes(lesson.id)) {
            completedCount++;
          } else {
            upcomingCount++;
          }
        }
      });
    });

    const averageClassSize = totalLessons > 0 ? Math.round(totalStudents / totalLessons) : 0;

    return {
      totalLessons,
      completedLessons: completedCount,
      upcomingLessons: upcomingCount,
      totalStudents,
      averageClassSize
    };
  };

  const stats = calculateStats();

  // Get available teachers from main timetable
  const availableTeachers = Object.keys(mainTimetable.teachers);

  // Computed values
  const currentLesson = getCurrentLesson();
  const nextLesson = getNextLesson();
  const remainingMinutes = getRemainingMinutes();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const isNoTermError = error === 'No term selected';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className={`${isNoTermError ? 'text-amber-600' : 'text-red-600'} mb-4`}>
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {isNoTermError ? 'No Term Selected' : 'Error Loading Timetable'}
          </h2>
          <p className="text-slate-600 mb-4">
            {isNoTermError 
              ? 'Please select a term from the dropdown to view your timetable.'
              : error}
          </p>
          {!isNoTermError && (
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container py-8 mx-auto max-w-7xl px-4">
        <TeacherTimetableControls
          teacherName={selectedTeacher}
          availableTeachers={availableTeachers}
          totalLessons={stats.totalLessons}
          completedLessons={stats.completedLessons}
          upcomingLessons={stats.upcomingLessons}
          totalStudents={stats.totalStudents}
          averageClassSize={stats.averageClassSize}
          onTeacherSelect={setSelectedTeacher}
          onSync={handleSync}
          onSave={handleSaveTeacherTimetable}
          onLoad={handleLoadTeacherTimetable}
          onLoadMockData={forceReloadMockData}
          isSyncing={isSyncing}
        />
        
        <TeacherTimetableHeader currentTime={currentTime} />
        
        <CurrentLessonBanner 
          currentLesson={currentLesson} 
          remainingMinutes={remainingMinutes} 
        />

        {/* Time Slots Display Section */}
        <div className="mb-6 bg-primary/5 dark:bg-primary/10 border-l-2 border-primary rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-primary text-sm">Class Periods</h3>
              {timetableData.timeSlots.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                  {timetableData.timeSlots.length} period{timetableData.timeSlots.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {timetableData.timeSlots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-primary/70">No time slots available</p>
              <p className="text-[10px] text-primary/50 mt-1">Time slots will appear here once loaded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {timetableData.timeSlots
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((slot) => (
                  <div key={slot.id} className="bg-white dark:bg-slate-800 rounded p-2 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-primary text-xs">Period {slot.periodNumber}</span>
                          <span className="text-slate-700 dark:text-slate-300 text-xs">{slot.displayTime}</span>
                        </div>
                        {slot.startTime && slot.endTime && (
                          <div className="text-slate-500 dark:text-slate-400 text-[9px] mt-0.5">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        <TeacherTimetableGrid
          schedule={timetableData.schedule}
          periods={timetableData.periods}
          weekDays={weekDays}
          completedLessons={completedLessons}
          getLessonStyles={getLessonStyles}
          renderLessonIndicators={renderLessonIndicators}
          timeSlots={timetableData.timeSlots}
          breaks={timetableData.breaksList}
          dayNames={dayNames}
        />

        <NextLessonPanel 
          nextLesson={nextLesson} 
          formatTimeUntil={formatTimeUntil} 
        />

        <TimetableLegend />
      </div>
    </div>
  );
};

export default TeacherTimetable;