'use client'

import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle2, BookOpen, CalendarDays, Timer, Users, GraduationCap, Zap, Star, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Types
type TimeBlock = {
  start: string
  end: string
  period: number
}

type TeacherLesson = {
  id: string
  subject: string
  room: string
  class: string
  grade?: string
  stream?: string
  day: string
  period: number
  totalStudents?: number
  completed?: boolean
}

type NextLessonInfo = {
  lesson: TeacherLesson
  startsIn: number
  time: string
  nextDay?: boolean
  period: string
  periodIndex: number
  minutesUntil: number
}

// Constants
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const BREAK_LETTERS = ['B', 'R', 'E', 'A', 'K']
const LUNCH_LETTERS = ['L', 'U', 'N', 'C', 'H']

const BREAKS: Record<string, TimeBlock[]> = {
  Monday: [
    { start: "10:30", end: "10:45", period: 2.5 },
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Tuesday: [
    { start: "10:30", end: "10:45", period: 2.5 },
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Wednesday: [
    { start: "10:30", end: "10:45", period: 2.5 },
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Thursday: [
    { start: "10:30", end: "10:45", period: 2.5 },
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Friday: [
    { start: "10:30", end: "10:45", period: 2.5 },
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
}

const LUNCH: Record<string, TimeBlock[]> = {
  Monday: [
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Tuesday: [
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Wednesday: [
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Thursday: [
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
  Friday: [
    { start: "12:30", end: "13:15", period: 4.5 },
  ],
}

const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

// Define periods for the school day (format: "start-end")
const periods = [
  "8:00-8:45",  // Period 1
  "8:50-9:35",  // Period 2
  "9:40-10:25", // Period 3
  "10:45-11:30", // Period 4 (after first break)
  "11:35-12:20", // Period 5
  "13:15-14:00", // Period 6 (after lunch)
  "14:05-14:50"  // Period 7
]

// Teacher's weekly schedule across different grades
// Define which period indices represent breaks and lunch
const BREAK_INDICES = [2, 5];
const LUNCH_INDEX = 8;

// Teacher's weekly schedule with breaks and lunch as separate columns
const teacherSchedule: Record<string, (TeacherLesson | null)[]> = {
  "MONDAY": [
    { id: "mon-1", subject: "Mathematics", grade: "Grade 7", stream: "A", room: "Lab 1", class: "7A", day: "MONDAY", period: 1, totalStudents: 45 },
    { id: "mon-2", subject: "Mathematics", grade: "Grade 8", stream: "B", room: "Lab 2", class: "8B", day: "MONDAY", period: 2, totalStudents: 42 },
    null, // Break placeholder (will be rendered separately)
    { id: "mon-3", subject: "Mathematics", grade: "Grade 6", stream: "A", room: "Room 12", class: "6A", day: "MONDAY", period: 3, totalStudents: 44 },
    null,
    null, // Break placeholder (will be rendered separately)
    { id: "mon-4", subject: "Mathematics", grade: "Grade 7", stream: "C", room: "Lab 1", class: "7C", day: "MONDAY", period: 4, totalStudents: 43 },
    null,
    null, // Lunch placeholder (will be rendered separately)
    { id: "mon-5", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", class: "8A", day: "MONDAY", period: 5, totalStudents: 45 }
  ],
  "TUESDAY": [
    { id: "tue-1", subject: "Mathematics", grade: "Grade 6", stream: "B", room: "Room 12", class: "6B", day: "TUESDAY", period: 1, totalStudents: 40 },
    { id: "tue-2", subject: "Mathematics", grade: "Grade 7", stream: "B", room: "Lab 1", class: "7B", day: "TUESDAY", period: 2, totalStudents: 44 },
    null, // Break placeholder
    { id: "tue-3", subject: "Mathematics", grade: "Grade 8", stream: "C", room: "Lab 2", class: "8C", day: "TUESDAY", period: 3, totalStudents: 41 },
    { id: "tue-4", subject: "Mathematics", grade: "Grade 6", stream: "C", room: "Room 12", class: "6C", day: "TUESDAY", period: 4, totalStudents: 42 },
    null, // Break placeholder
    null,
    { id: "tue-5", subject: "Mathematics", grade: "Grade 7", stream: "A", room: "Lab 1", class: "7A", day: "TUESDAY", period: 5, totalStudents: 45 },
    null, // Lunch placeholder
    null
  ],
  "WEDNESDAY": [
    { id: "wed-1", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", class: "8A", day: "WEDNESDAY", period: 1, totalStudents: 45 },
    null,
    null, // Break placeholder
    { id: "wed-2", subject: "Mathematics", grade: "Grade 7", stream: "C", room: "Lab 1", class: "7C", day: "WEDNESDAY", period: 2, totalStudents: 43 },
    { id: "wed-3", subject: "Mathematics", grade: "Grade 6", stream: "A", room: "Room 12", class: "6A", day: "WEDNESDAY", period: 3, totalStudents: 44 },
    null, // Break placeholder
    { id: "wed-4", subject: "Mathematics", grade: "Grade 8", stream: "B", room: "Lab 2", class: "8B", day: "WEDNESDAY", period: 4, totalStudents: 42 },
    { id: "wed-5", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", class: "8A", day: "WEDNESDAY", period: 5, totalStudents: 45 },
    null, // Lunch placeholder
    { id: "wed-6", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", class: "8A", day: "WEDNESDAY", period: 6, totalStudents: 45 },
  ],
  "THURSDAY": [
    { id: "thu-1", subject: "Mathematics", grade: "Grade 7", stream: "B", room: "Lab 1", class: "7B", day: "THURSDAY", period: 1, totalStudents: 44 },
    { id: "thu-2", subject: "Mathematics", grade: "Grade 6", stream: "C", room: "Room 12", class: "6C", day: "THURSDAY", period: 2, totalStudents: 42 },
    null, // Break placeholder
    { id: "thu-3", subject: "Mathematics", grade: "Grade 8", stream: "C", room: "Lab 2", class: "8C", day: "THURSDAY", period: 3, totalStudents: 41 },
    { id: "thu-4", subject: "Mathematics", grade: "Grade 7", stream: "A", room: "Lab 1", class: "7A", day: "THURSDAY", period: 4, totalStudents: 45 },
    null, // Break placeholder
    { id: "thu-5", subject: "Mathematics", grade: "Grade 6", stream: "B", room: "Room 12", class: "6B", day: "THURSDAY", period: 5, totalStudents: 40 },
    null, // Lunch placeholder
    null
  ],
  "FRIDAY": [
    { id: "fri-1", subject: "Mathematics", grade: "Grade 8", stream: "C", room: "Lab 2", class: "8C", day: "FRIDAY", period: 1, totalStudents: 41 },
    { id: "fri-2", subject: "Mathematics", grade: "Grade 7", stream: "C", room: "Lab 1", class: "7C", day: "FRIDAY", period: 2, totalStudents: 43 },
    null, // Break placeholder
    { id: "fri-3", subject: "Mathematics", grade: "Grade 6", stream: "B", room: "Room 12", class: "6B", day: "FRIDAY", period: 3, totalStudents: 40 },
    { id: "fri-4", subject: "Mathematics", grade: "Grade 8", stream: "B", room: "Lab 2", class: "8B", day: "FRIDAY", period: 4, totalStudents: 42 },
    null, // Break placeholder
    null,
    { id: "fri-5", subject: "Mathematics", grade: "Grade 6", stream: "A", room: "Room 12", class: "6A", day: "FRIDAY", period: 5, totalStudents: 44 },
    null, // Lunch placeholder
    null
  ]
}

// Calculate teacher's statistics
const teacherStats = {
  totalClasses: 17,
  gradeDistribution: {
    "Grade 6": 6,
    "Grade 7": 6,
    "Grade 8": 5
  },
  totalStudents: 126, // Unique students
  classesPerDay: {
    "MONDAY": 5,
    "TUESDAY": 4,
    "WEDNESDAY": 3,
    "THURSDAY": 4,
    "FRIDAY": 4
  }
}

// Helper to parse time strings like "8:20" or "2:00" into total minutes from midnight
// Assumes hours 1-7 are PM, others are AM or 12PM
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Convert to 24-hour format if needed
  let totalHours = hours;
  if (hours >= 1 && hours <= 7) {
    totalHours += 12; // Assume PM for 1-7
  }
  
  return totalHours * 60 + minutes;
}

// Helper to format time until next lesson
function formatTimeUntil(minutesUntil: number): string {
  if (minutesUntil < 60) {
    return `Starting in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    return `Starting in ${hours} hour${hours !== 1 ? 's' : ''} ${mins > 0 ? `and ${mins} minute${mins !== 1 ? 's' : ''}` : ''}`;
  }
}

export default function TimetablePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [completedLessons, setCompletedLessons] = useState([
    "mon-1", "mon-2", 
    "tue-1", "tue-4", 
    "wed-1", "wed-3", "wed-5",
    "thu-3"
  ])
  const [nextLesson, setNextLesson] = useState<NextLessonInfo | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    setNextLesson(getNextLesson())
  }, [currentTime])

  const getCurrentPeriod = () => {
    const now = currentTime
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTimeInMinutes = hours * 60 + minutes

    for (let i = 0; i < periods.length; i++) {
      const [start, end] = periods[i].split('-')
      const [startHour, startMinute] = start.split(':').map(Number)
      const [endHour, endMinute] = end.split(':').map(h => {
        // Convert 2:00 to 14:00 for proper comparison
        if (h.toString().startsWith('2')) return 14
        return Number(h)
      })
      
      const periodStartInMinutes = startHour * 60 + startMinute
      const periodEndInMinutes = endHour * 60 + endMinute

      if (currentTimeInMinutes >= periodStartInMinutes && currentTimeInMinutes < periodEndInMinutes) {
        return i
      }
    }
    return -1
  }

  const getCurrentDay = () => {
    const day = currentTime.toLocaleDateString('en-KE', { weekday: 'long' }).toUpperCase() as keyof typeof teacherStats.classesPerDay
    return weekDays.includes(day) ? day : 'MONDAY'
  }

  const getNextLesson = (): NextLessonInfo | null => {
    const currentDay = getCurrentDay()
    const currentPeriod = getCurrentPeriod()
    const dayIndex = weekDays.indexOf(currentDay)

    // Check remaining periods today
    for (let p = currentPeriod + 1; p < periods.length; p++) {
      const lesson = teacherSchedule[currentDay]?.[p]
      if (lesson && typeof lesson !== 'string') {
        const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
        const lessonStartTime = periods[p].split('-')[0]
        const [hours, minutes] = lessonStartTime.split(':').map(Number)
        const lessonStartMinutes = hours * 60 + minutes
        const minutesUntil = lessonStartMinutes - currentTimeMinutes
        
        return {
          lesson,
          startsIn: minutesUntil,
          time: lessonStartTime,
          period: `Period ${p + 1}`,
          periodIndex: p,
          minutesUntil
        }
      }
    }

    // If no lessons left today, check tomorrow
    if (dayIndex < weekDays.length - 1) {
      const nextDay = weekDays[dayIndex + 1]
      for (let p = 0; p < periods.length; p++) {
        const lesson = teacherSchedule[nextDay]?.[p]
        if (lesson && typeof lesson !== 'string') {
          const lessonStartTime = periods[p].split('-')[0]
          return {
            lesson,
            startsIn: 24 * 60, // Approx for tomorrow
            nextDay: true,
            time: lessonStartTime || '',
            period: `Period ${p + 1}`,
            periodIndex: p,
            minutesUntil: 24 * 60 // Approx for tomorrow
          }
        }
      }
    }

    return null
  }

  const getTimeDifference = (targetTime: string) => {
    const now = currentTime
    const [targetHour, targetMin] = targetTime.split(':').map(str => {
      if (str.includes('PM') && !str.startsWith('12')) {
        return parseInt(str) + 12
      }
      return parseInt(str)
    })
    
    const targetDate = new Date(now)
    targetDate.setHours(targetHour, targetMin, 0)
    
    const diffInMinutes = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60))
    return diffInMinutes
  }

  const getLessonStatus = (lesson: TeacherLesson | 'BREAK' | 'LUNCH' | null, periodIndex: number, day: string) => {
    if (!lesson || typeof lesson === 'string') return 'break'
    if (completedLessons.includes(lesson.id)) return 'completed'
    
    const currentDay = getCurrentDay()
    const currentPeriod = getCurrentPeriod()
    const nextLesson = getNextLesson()

    // Current lesson
    if (currentDay === day && currentPeriod === periodIndex) {
      return 'ongoing'
    }

    // Next lesson - only mark the exact next lesson
    if (nextLesson) {
      if (!nextLesson.nextDay && currentDay === day && lesson.id === nextLesson.lesson.id) {
        return 'next'
      }
      if (nextLesson.nextDay && 
          weekDays.indexOf(day) === weekDays.indexOf(currentDay) + 1 && 
          lesson.id === nextLesson.lesson.id) {
        return 'next'
      }
    }

    // Past or upcoming
    const dayIndex = weekDays.indexOf(day)
    const currentDayIndex = weekDays.indexOf(currentDay)
    
    if (dayIndex < currentDayIndex) return 'past'
    if (dayIndex > currentDayIndex) return 'upcoming'
    if (currentPeriod > periodIndex) return 'past'
    return 'upcoming'
  }

  // Helper function to get the index of the first lesson in a day
  const getFirstLessonIndex = (day: string) => {
    const schedule = teacherSchedule[day]
    return schedule.findIndex(lesson => lesson && typeof lesson !== 'string')
  }

  // Helper function to get the index of the next lesson after a given period
  const getNextLessonIndex = (currentPeriod: number, day: string) => {
    const schedule = teacherSchedule[day]
    return schedule.findIndex((lesson, index) => 
      index > currentPeriod && lesson && typeof lesson !== 'string'
    )
  }

    // Helper function to render break letters vertically (without animations)
  // Helper function to render break letters vertically (without animations)
  const VerticalBreak = ({ letters }: { letters: string[] }) => {
    return (
      <div className="flex flex-col gap-1 items-center justify-center">
        {letters.map((letter, index) => (
          <div 
            key={index}
            className="text-xs font-bold text-primary/80 dark:text-primary"
          >
            {letter}
          </div>
        ))}
      </div>
    )
  }

  // Format time until a lesson starts
  const formatTimeUntil = (minutes: number) => {
    if (minutes < 60) return `Starts in ${minutes} minute${minutes === 1 ? '' : 's'}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `Starts in ${hours} hour${hours === 1 ? '' : 's'}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}` : ''}`;
  }

  // Get styling for lessons based on their status
  const getLessonStyles = (lesson: TeacherLesson | null, periodIndex: number, day: string) => {
    if (!lesson) return "bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600";
    
    const status = getLessonStatus(lesson, periodIndex, day);
    
    switch (status) {
      case 'ongoing':
        return 'bg-primary/90 text-white border-primary-foreground/20 shadow-md hover:bg-primary hover:shadow-lg';
      case 'next':
        return 'bg-[#246a59]/20 dark:bg-[#246a59]/30 border-[#246a59]/30 dark:border-[#246a59]/50 text-[#246a59] dark:text-[#246a59] shadow-md hover:shadow-lg';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-900 dark:text-green-200';
      case 'upcoming':
        return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50';
      case 'past':
        return 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
      case 'break':
        return 'bg-orange-50/50 dark:bg-slate-800/30 text-orange-500 dark:text-orange-300 border-orange-100 dark:border-orange-900/20';
      default:
        return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  }

  // Render indicators for lessons based on their status
  const renderLessonIndicators = (lesson: TeacherLesson, periodIndex: number, day: string) => {
    const status = getLessonStatus(lesson, periodIndex, day);
    
    if (status === 'ongoing') {
      return (
        <div className="absolute bottom-0 right-0 transform translate-x-1/3 translate-y-1/3">
          <div className="flex items-center justify-center h-5 w-5 rounded-none bg-white dark:bg-slate-800 shadow-sm">
            <div className="h-3 w-3 rounded-none bg-primary" />
          </div>
        </div>
      )
    }
    if (status === 'next') {
      return (
        <div className="absolute -bottom-1 -left-1">
          <div className="flex items-center justify-center h-5 w-5 rounded-none bg-white dark:bg-slate-800 shadow-sm">
            <Timer className="h-3 w-3 text-[#246a59]/70" />
          </div>
        </div>
      )
    }
    return null;
  }

  // Function to get current lesson
  const getCurrentLesson = () => {
    const day = getCurrentDay();
    if (!day) return null;
    
    const currentPeriod = getCurrentPeriod();
    // Handle both object format and number format
    const periodIndex = typeof currentPeriod === 'object' 
      ? (currentPeriod as any)?.periodIndex 
      : typeof currentPeriod === 'number' 
        ? currentPeriod 
        : undefined;
    
    if (periodIndex === undefined) return null;
    
    return teacherSchedule[day]?.[periodIndex] || null;
  };
  
  // Get remaining minutes in current period
  const getRemainingMinutes = () => {
    const period = getCurrentPeriod();
    if (!period) return null;
    
    // Find the corresponding period string
    const periodIndex = typeof period === 'object' 
      ? (period as any)?.periodIndex 
      : typeof period === 'number' 
        ? period 
        : -1;
    
    if (periodIndex < 0 || periodIndex >= periods.length) return null;
    
    const periodStr = periods[periodIndex];
    const [startTime, endTime] = periodStr.split('-');
    const endMinutes = parseTime(endTime);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return Math.max(0, endMinutes - currentMinutes);
  };
  

  
  const currentLesson = getCurrentLesson();
  const remainingMinutes = getRemainingMinutes();

  // Format current time
  const formatCurrentTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  return (
    <div className="container py-8 mx-auto max-w-6xl">
      {/* Current Time Display */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex gap-2 items-center text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="font-medium">Term 2, 2025</span>
        </div>
        
        <div className="flex items-center gap-3 bg-[#246a59]/10 px-4 py-2 rounded-lg border border-[#246a59]/20">
          <Clock className="h-5 w-5 text-[#246a59]" />
          <div>
            <div className="text-xl font-bold text-[#246a59]">
              {formatCurrentTime(currentTime)}
            </div>
            <div className="text-xs text-[#246a59]/70">
              {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(currentTime)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Current Lesson Banner */}
      {currentLesson ? (
        <div className="relative overflow-hidden rounded-lg mb-8 border-2 border-[#246a59] shadow-lg">
          {/* Decorative pulse */}
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center overflow-hidden">
            <div className="absolute w-64 h-64 bg-[#246a59]/5 rounded-full animate-pulse-slow"></div>
            <div className="absolute w-80 h-80 bg-[#246a59]/10 rounded-full animate-pulse-slower delay-150"></div>
            <div className="absolute w-48 h-48 bg-[#246a59]/15 rounded-full animate-pulse"></div>
          </div>
          
          <div className="relative p-6 md:p-8 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
            <div className="absolute top-0 right-0 p-3 bg-[#246a59] text-white font-bold">
              NOW
              <div className="h-1.5 w-12 bg-white/80 mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white" 
                  style={{ width: `${remainingMinutes ? (remainingMinutes / 45) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 md:gap-8">
              <div className="h-16 w-16 flex items-center justify-center bg-[#246a59]/20 rounded-lg">
                <BookOpen className="h-8 w-8 text-[#246a59]" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {currentLesson.subject}
                  </h2>
                  <Badge className="bg-[#246a59] hover:bg-[#246a59]/90">Ongoing</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {currentLesson.class} ({currentLesson.totalStudents} students)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {currentLesson.grade} {currentLesson.stream}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#246a59]" />
                    <span className="text-slate-600 dark:text-slate-300">{currentLesson.room}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#246a59]" />
                      <span className="text-[#246a59] font-medium">
                        {remainingMinutes ? `${remainingMinutes} min remaining` : 'Ending soon'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="bg-[#246a59] hover:bg-[#246a59]/90 text-white"
                    >
                      <Star className="h-4 w-4 mr-1" /> Mark attendance
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/10"
                    >
                      <Activity className="h-4 w-4 mr-1" /> Class activities
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-200">No active class right now</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Check your upcoming lessons below</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/10">
              <CalendarDays className="h-4 w-4 mr-1" /> View schedule
            </Button>
          </div>
        </div>
      )}
      
      {/* Weekly Schedule Title */}
      <h2 className="text-xl font-semibold text-[#246a59] mb-4">Weekly Schedule</h2>
      
      {/* Timetable Grid */}
      <div className="grid grid-cols-8 gap-1 mt-4">
        {/* Period Headers */}
        <div className="p-3"></div> {/* Empty cell for day labels */}
        {periods.map((period, periodIndex) => (
          <div key={`header-${periodIndex}`} className="p-3 text-center font-semibold bg-slate-100 dark:bg-slate-800 rounded-none">
            {period}
          </div>
        ))}
        
        {/* Day Rows */}
        {weekDays.map(day => (
          <React.Fragment key={`day-${day}`}>
            {/* Day Label */}
            <div className="p-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-none">
              {day}
            </div>
            
            {/* Period Columns */}
            {periods.map((period, periodIndex) => {
              const lesson = teacherSchedule[day]?.[periodIndex];
              return (
                <div 
                  key={`${day}-${periodIndex}`}
                  className={cn(
                    "p-3 text-center rounded-none border shadow-sm",
                    getLessonStyles(lesson, periodIndex, day)
                  )}
                >

                  {lesson && (
                    <div>
                      <div className="text-lg font-medium">{lesson.subject}</div>
                      <div className="text-sm text-muted-foreground">
                        {lesson.grade} {lesson.stream} · {lesson.room}
                      </div>
                      {renderLessonIndicators(lesson, periodIndex, day)}
                      {completedLessons.includes(lesson.id) && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-5 w-5 bg-white dark:bg-slate-800 rounded-none shadow-sm flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Next Lesson */}
      <div className={`relative overflow-hidden rounded-none p-6 backdrop-blur-sm border shadow-xl transition-all duration-500 mt-6 ${
        nextLesson 
          ? 'bg-gradient-to-br from-[#e6f0ee] to-[#d0e0dd] border-[#246a59]/30 shadow-[#246a59]/20' 
          : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
      }`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#246a59]/20 to-[#246a59]/30 rounded-none -translate-y-16 translate-x-16" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#246a59] rounded-none text-white shadow-lg">
            <Timer className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Next Lesson</h3>
        </div>
        
        {nextLesson ? (
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-2">{nextLesson.lesson.subject}</p>
            <p className="text-slate-600 mb-4">
              {nextLesson.lesson.grade} {nextLesson.lesson.stream} • {nextLesson.lesson.room}
            </p>
            <div className="bg-gradient-to-r from-[#246a59] to-[#1a4e42] text-white rounded-none p-3">
              <p className="font-medium">
                {nextLesson.nextDay 
                  ? `Tomorrow at ${nextLesson.time}`
                  : formatTimeUntil(nextLesson.startsIn || 0)
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-none flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600">No more classes today</p>
          </div>
        )}
      </div>
    </div>

    {/* Enhanced Legend */}
    <div 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-none border shadow-md p-5 mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center h-7 w-7 rounded-none bg-primary/10">
          <Star className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-base font-medium">Legend</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { label: "Current Lesson", icon: <div className="h-3 w-3 rounded-none bg-primary" />, color: "bg-primary/10" },
          { label: "Next Lesson", icon: <Timer className="h-3 w-3 text-[#246a59]/70" />, color: "bg-primary/10" },
          { label: "Completed", icon: <CheckCircle2 className="h-3 w-3 text-green-500" />, color: "bg-green-500/10" },
          { label: "Break Time", icon: <Activity className="h-3 w-3 text-amber-500" />, color: "bg-amber-500/10" },
          { label: "Lunch", icon: <Users className="h-3 w-3 text-orange-500" />, color: "bg-orange-500/10" },
          { label: "Free Period", icon: <Clock className="h-3 w-3 text-slate-400" />, color: "bg-slate-100" }
        ].map((item, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 rounded-none px-3 py-1.5 border shadow-sm"
        >
          <div className={`flex items-center justify-center h-6 w-6 rounded-none ${item.color}`}>
            {item.icon}
          </div>
          <span className="text-xs font-medium">{item.label}</span>
        </div>
      ))}
      </div>
    </div>
    </div>
  );
}