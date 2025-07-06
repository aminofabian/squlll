'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Timer } from 'lucide-react';
import {
  TeacherTimetableHeader,
  CurrentLessonBanner,
  TeacherTimetableGrid,
  NextLessonPanel,
  TimetableLegend,
  TeacherTimetableControls
} from './components';
import { useTimetableStore, type TeacherLesson } from '@/lib/stores/useTimetableStore';

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
  stats: TeacherStats;
}

const TeacherTimetable = () => {
  // Use shared store
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
    schedule: teacherTimetable.schedule,
    breaks: {
      Monday: [{ start: "10:30", end: "10:45", period: 2.5 }],
      Tuesday: [{ start: "10:30", end: "10:45", period: 2.5 }],
      Wednesday: [{ start: "10:30", end: "10:45", period: 2.5 }],
      Thursday: [{ start: "10:30", end: "10:45", period: 2.5 }],
      Friday: [{ start: "10:30", end: "10:45", period: 2.5 }]
    },
    lunch: {
      Monday: [{ start: "12:30", end: "13:15", period: 4.5 }],
      Tuesday: [{ start: "12:30", end: "13:15", period: 4.5 }],
      Wednesday: [{ start: "12:30", end: "13:15", period: 4.5 }],
      Thursday: [{ start: "12:30", end: "13:15", period: 4.5 }],
      Friday: [{ start: "12:30", end: "13:15", period: 4.5 }]
    },
    periods: teacherTimetable.periods,
    stats: teacherTimetable.stats
  });

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  // Filter timetable data by selected teacher
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

  // Set default teacher when component mounts and force reload data
  useEffect(() => {
    // Force reload mock data to ensure latest changes are reflected
    forceReloadMockData();
    
    const availableTeachers = Object.keys(mainTimetable.teachers);
    console.log('Available teachers:', availableTeachers);
    if (availableTeachers.length > 0 && !selectedTeacher) {
      setSelectedTeacher(availableTeachers[0]);
      console.log('Set default teacher to:', availableTeachers[0]);
    }
  }, [mainTimetable.teachers, selectedTeacher, forceReloadMockData]);

  // Sync with store changes and filter by selected teacher
  useEffect(() => {
    if (selectedTeacher) {
      console.log('Teacher timetable data updated:', teacherTimetable);
      console.log('Main timetable subjects count:', Object.keys(mainTimetable.subjects).length);
      console.log('Breaks in main timetable:', Object.entries(mainTimetable.subjects).filter(([key, data]) => data?.isBreak).length);
      
      const filteredData = filterTimetableByTeacher(selectedTeacher);
      console.log('Filtered data for teacher:', selectedTeacher, filteredData);
      
      setTimetableData(prev => ({
        ...prev,
        schedule: filteredData.schedule,
        periods: filteredData.periods,
        stats: filteredData.stats
      }));
    }
  }, [teacherTimetable, mainTimetable, selectedTeacher]);

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
        if (daySchedule[i]) {
          nextLessonIndex = i;
          break;
        }
      }
    } else {
      // Find first lesson today
      for (let i = 0; i < daySchedule.length; i++) {
        if (daySchedule[i]) {
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
            if (tomorrowSchedule[i]) {
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

    const periodTimes = [
      { start: parseTime("8:00"), end: parseTime("8:45") },
      { start: parseTime("8:50"), end: parseTime("9:35") },
      { start: parseTime("9:40"), end: parseTime("10:25") },
      { start: parseTime("10:45"), end: parseTime("11:30") },
      { start: parseTime("11:35"), end: parseTime("12:20") },
      { start: parseTime("13:15"), end: parseTime("14:00") },
      { start: parseTime("14:05"), end: parseTime("14:50") }
    ];

    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const lessonStartTime = periodTimes[nextLessonIndex]?.start || 0;
    const minutesUntil = lessonStartTime - currentTimeMinutes;

    return {
      lesson,
      startsIn: minutesUntil,
      time: timetableData.periods[nextLessonIndex] || `Period ${nextLessonIndex + 1}`,
      nextDay,
      period: timetableData.periods[nextLessonIndex] || `Period ${nextLessonIndex + 1}`,
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

    return daySchedule[currentPeriod - 1] || null;
  };

  const getRemainingMinutes = () => {
    const currentPeriod = getCurrentPeriod();
    if (!currentPeriod) return 0;

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

    const periodEnd = periodTimes[currentPeriod - 1]?.end || 0;
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
      await syncTeacherTimetable();
      // Update local state after sync
      setTimetableData(prev => ({
        ...prev,
        schedule: teacherTimetable.schedule,
        periods: teacherTimetable.periods,
        stats: teacherTimetable.stats
      }));
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
        
        <TeacherTimetableGrid
          schedule={timetableData.schedule}
          periods={timetableData.periods}
          weekDays={weekDays}
          completedLessons={completedLessons}
          getLessonStyles={getLessonStyles}
          renderLessonIndicators={renderLessonIndicators}
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