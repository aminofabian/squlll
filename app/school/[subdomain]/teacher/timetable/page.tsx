'use client'

import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle2, BookOpen, CalendarDays, Timer, Users, GraduationCap, Zap, Star, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface TeacherLesson {
  id: string
  subject: string
  grade: string
  stream: string
  room: string
  completed?: boolean
  totalStudents: number
}

// Define break letters
const BREAK_LETTERS = ['B', 'R', 'E', 'A', 'K']
const LUNCH_LETTERS = ['L', 'U', 'N', 'C', 'H']

// Define periods with breaks and lunch integrated
const periods = [
  "8:20-8:55",  // Period 1
  "8:55-9:30",  // Period 2
  "9:30-9:50",  // BREAK
  "9:50-10:25", // Period 3
  "10:25-11:00", // Period 4
  "11:00-11:30", // BREAK
  "11:30-12:05", // Period 5
  "12:05-12:40", // Period 6
  "12:40-2:00", // LUNCH
  "2:00-2:35",  // Period 7
]

const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

// Teacher's weekly schedule across different grades
// Define which period indices represent breaks and lunch
const BREAK_INDICES = [2, 5];
const LUNCH_INDEX = 8;

// Teacher's weekly schedule with breaks and lunch as separate columns
const teacherSchedule: Record<string, (TeacherLesson | null)[]> = {
  "MONDAY": [
    { id: "mon-1", subject: "Mathematics", grade: "Grade 7", stream: "A", room: "Lab 1", totalStudents: 45 },
    { id: "mon-2", subject: "Mathematics", grade: "Grade 8", stream: "B", room: "Lab 2", totalStudents: 42 },
    null, // Break placeholder (will be rendered separately)
    { id: "mon-3", subject: "Mathematics", grade: "Grade 6", stream: "A", room: "Room 12", totalStudents: 44 },
    null,
    null, // Break placeholder (will be rendered separately)
    { id: "mon-4", subject: "Mathematics", grade: "Grade 7", stream: "C", room: "Lab 1", totalStudents: 43 },
    null,
    null, // Lunch placeholder (will be rendered separately)
    { id: "mon-5", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", totalStudents: 45 }
  ],
  "TUESDAY": [
    { id: "tue-1", subject: "Mathematics", grade: "Grade 6", stream: "B", room: "Room 12", totalStudents: 40 },
    { id: "tue-2", subject: "Mathematics", grade: "Grade 7", stream: "B", room: "Lab 1", totalStudents: 44 },
    null, // Break placeholder
    { id: "tue-3", subject: "Mathematics", grade: "Grade 8", stream: "C", room: "Lab 2", totalStudents: 41 },
    { id: "tue-4", subject: "Mathematics", grade: "Grade 6", stream: "C", room: "Room 12", totalStudents: 42 },
    null, // Break placeholder
    null,
    { id: "tue-5", subject: "Mathematics", grade: "Grade 7", stream: "A", room: "Lab 1", totalStudents: 45 },
    null, // Lunch placeholder
    null
  ],
  "WEDNESDAY": [
    { id: "wed-1", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", totalStudents: 45 },
    null,
    null, // Break placeholder
    { id: "wed-2", subject: "Mathematics", grade: "Grade 7", stream: "C", room: "Lab 1", totalStudents: 43 },
    { id: "wed-3", subject: "Mathematics", grade: "Grade 6", stream: "A", room: "Room 12", totalStudents: 44 },
    null, // Break placeholder
    { id: "wed-4", subject: "Mathematics", grade: "Grade 8", stream: "B", room: "Lab 2", totalStudents: 42 },
    { id: "wed-5", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", totalStudents: 45 },
    null, // Lunch placeholder
    { id: "wed-6", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", totalStudents: 45 },
  ],
  "THURSDAY": [
    { id: "thu-1", subject: "Mathematics", grade: "Grade 7", stream: "B", room: "Lab 1", totalStudents: 44 },
    { id: "thu-2", subject: "Mathematics", grade: "Grade 6", stream: "C", room: "Room 12", totalStudents: 42 },
    null, // Break placeholder
    { id: "thu-3", subject: "Mathematics", grade: "Grade 8", stream: "C", room: "Lab 2", totalStudents: 41 },
    null,
    null, // Break placeholder
    { id: "thu-4", subject: "Mathematics", grade: "Grade 7", stream: "A", room: "Lab 1", totalStudents: 45 },
    { id: "thu-5", subject: "Mathematics", grade: "Grade 6", stream: "B", room: "Room 12", totalStudents: 40 },
    null, // Lunch placeholder
    null
  ],
  "FRIDAY": [
    { id: "fri-1", subject: "Mathematics", grade: "Grade 8", stream: "A", room: "Lab 2", totalStudents: 45 },
    { id: "fri-2", subject: "Mathematics", grade: "Grade 7", stream: "B", room: "Lab 1", totalStudents: 44 },
    null, // Break placeholder
    { id: "fri-3", subject: "Mathematics", grade: "Grade 6", stream: "C", room: "Room 12", totalStudents: 42 },
    { id: "fri-4", subject: "Mathematics", grade: "Grade 8", stream: "C", room: "Lab 2", totalStudents: 41 },
    null, // Break placeholder
    null,
    { id: "fri-5", subject: "Mathematics", grade: "Grade 6", stream: "A", room: "Room 12", totalStudents: 44 },
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
  let [hour, minute] = timeStr.split(':').map(Number);
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return hour * 60 + minute;
}

export default function TimetablePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

  const getNextLesson = () => {
    const currentDay = getCurrentDay()
    const currentPeriod = getCurrentPeriod()
    
    if (!currentDay) return null

    const todaySchedule = teacherSchedule[currentDay]
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    // Look for next lesson today
    for (let i = currentPeriod + 1; i < periods.length; i++) {
      const lesson = todaySchedule[i]
      if (lesson && typeof lesson !== 'string') {
        const [startTime] = periods[i].split('-')
        const [startHour, startMinute] = startTime.split(':').map(Number)
        const startInMinutes = (startHour >= 14 ? startHour : startHour) * 60 + startMinute
        const minutesUntil = startInMinutes - currentMinutes

        return {
          lesson,
          startsIn: minutesUntil,
          time: startTime
        }
      }
    }

    // Look for first lesson of next day
    const currentDayIndex = weekDays.indexOf(currentDay)
    if (currentDayIndex < weekDays.length - 1) {
      const nextDay = weekDays[currentDayIndex + 1]
      const nextDaySchedule = teacherSchedule[nextDay]
      
      for (let i = 0; i < periods.length; i++) {
        const lesson = nextDaySchedule[i]
        if (lesson && typeof lesson !== 'string') {
          const [startTime] = periods[i].split('-')
          const [startHour, startMinute] = startTime.split(':').map(Number)
          
          // Calculate minutes until tomorrow's lesson
          const minutesUntilMidnight = (24 * 60) - currentMinutes
          const minutesFromMidnight = startHour * 60 + startMinute
          const minutesUntil = minutesUntilMidnight + minutesFromMidnight

          return {
            lesson,
            startsIn: minutesUntil,
            nextDay: true,
            time: startTime
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

  // Helper function to render break letters vertically
  const VerticalBreak = ({ letters }: { letters: string[] }) => (
    <div className="flex flex-col items-center justify-center h-full gap-[2px]">
      {letters.map((letter, index) => (
        <div 
          key={index} 
          className="w-3 h-3 flex items-center justify-center font-semibold text-[8px] text-primary"
        >
          {letter}
        </div>
      ))}
    </div>
  )

  const renderLessonIndicators = (lesson: TeacherLesson, periodIndex: number, day: string) => {
    const status = getLessonStatus(lesson, periodIndex, day)
    
    return (
      <div className="absolute bottom-0 right-0 flex gap-1 p-1">
        {status === "ongoing" && (
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Current lesson" />
        )}
        {status === "next" && (
          <div className="h-2 w-2 rounded-full bg-blue-500" title="Next lesson" />
        )}
        {status === "upcoming" && (
          <div className="h-2 w-2 rounded-full bg-gray-300" title="Upcoming today" />
        )}
      </div>
    )
  }

  const getLessonStyles = (lesson: TeacherLesson | null, periodIndex: number, day: string) => {
    if (!lesson) return 'bg-white dark:bg-slate-900'
    
    const status = getLessonStatus(lesson, periodIndex, day)
    const baseStyles = "transition-all h-full relative"
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-50 dark:bg-green-900/20`
      case 'ongoing':
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-500 animate-pulse`
      case 'next':
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-dashed`
      case 'upcoming':
        return `${baseStyles} bg-white dark:bg-slate-800`
      default:
        return `${baseStyles} bg-white dark:bg-slate-900`
    }
  }

  // Helper function to render break text vertically
  const VerticalText = ({ text }: { text: string }) => (
    <div className="flex flex-col justify-center items-center h-full">
      {text.split('').map((char, i) => (
        <span key={i} className="text-xs font-semibold">
          {char}
        </span>
      ))}
    </div>
  )

  const getCompletedClassesByGrade = () => {
    const completed = {
      "Grade 6": 0,
      "Grade 7": 0,
      "Grade 8": 0
    }

    completedLessons.forEach(lessonId => {
      for (const daySchedule of Object.values(teacherSchedule)) {
        const lesson = daySchedule.find(l => l && typeof l !== 'string' && l.id === lessonId) as TeacherLesson
        if (lesson?.grade) {
          completed[lesson.grade as keyof typeof completed]++
        }
      }
    })

    return completed
  }

  const nextLesson = getNextLesson()
  const completedByGrade = getCompletedClassesByGrade()

  // Helper function to format time until next lesson
  const formatTimeUntil = (minutes: number): string => {
    if (minutes < 0) return "Tomorrow"
    
    if (minutes < 60) {
      return `In ${minutes} minutes`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours >= 24) {
      const timeStr = minutes >= (36 * 60) ? 
        "the day after tomorrow" : 
        `tomorrow at ${nextLesson?.time || ''}`
      return timeStr
    }
    
    if (remainingMinutes === 0) {
      return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`
    }
    
    return `In ${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
      <div className="space-y-8 p-6">
        {/* Header with modern styling */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 backdrop-blur-sm" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    Mathematics Teacher
                  </h1>
                  <p className="text-purple-100 text-lg">
                    {currentTime.toLocaleDateString('en-KE', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">
                  {currentTime.toLocaleTimeString('en-KE')}
                </div>
                <div className="text-sm text-purple-200">Live Time</div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping opacity-20" />
                <Clock className="h-12 w-12 relative z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats with glassmorphism effect */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: "Total Classes", value: teacherStats.totalClasses, color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
            { icon: Users, label: "Total Students", value: teacherStats.totalStudents, color: "from-green-500 to-emerald-500", bg: "bg-green-50" },
            { icon: GraduationCap, label: "Grades Taught", value: 3, color: "from-purple-500 to-violet-500", bg: "bg-purple-50" },
            { icon: Zap, label: "Today's Classes", value: teacherStats.classesPerDay[getCurrentDay() || 'MONDAY'], color: "from-orange-500 to-red-500", bg: "bg-orange-50" }
          ].map((stat, index) => (
            <div key={index} className={`${stat.bg} dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Lesson Cards with modern design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Lesson */}
          <div className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border shadow-xl transition-all duration-500 ${
            getCurrentPeriod() !== -1 
              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-yellow-200/50' 
              : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full -translate-y-16 translate-x-16" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500 rounded-xl text-white shadow-lg">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Current Lesson</h3>
                {getCurrentPeriod() !== -1 && (
                  <div className="ml-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-600">LIVE</span>
                    </div>
                  </div>
                )}
              </div>
              
              {(() => {
                if (getCurrentPeriod() !== -1 && getCurrentDay()) {
                  const currentLesson = teacherSchedule[getCurrentDay()][getCurrentPeriod()]
                  if (currentLesson && typeof currentLesson !== 'string') {
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-slate-900">{currentLesson.subject}</p>
                            <p className="text-slate-600">
                              {currentLesson.grade} {currentLesson.stream} • {currentLesson.room}
                            </p>
                          </div>
                          {!completedLessons.includes(currentLesson.id) && (
                            <Button
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={() => setCompletedLessons(prev => [...prev, currentLesson.id])}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 bg-white/50 rounded-lg p-3">
                          {periods[getCurrentPeriod()]}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Timer className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-slate-600 font-medium">Break/Lunch time</p>
                    </div>
                  )
                }
                return (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600">No active lesson</p>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Next Lesson */}
          <div className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border shadow-xl transition-all duration-500 ${
            nextLesson 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-blue-200/50' 
              : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -translate-y-16 translate-x-16" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg">
                  <Timer className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Next Lesson</h3>
                {nextLesson && (
                  <div className="ml-auto">
                    <Star className="h-5 w-5 text-blue-500" />
                  </div>
                )}
              </div>
              
              {nextLesson ? (
                <div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{nextLesson.lesson.subject}</p>
                  <p className="text-slate-600 mb-4">
                    {nextLesson.lesson.grade} {nextLesson.lesson.stream} • {nextLesson.lesson.room}
                  </p>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-3">
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
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No more classes today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Timetable Grid */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <CalendarDays className="h-6 w-6" />
              Weekly Schedule
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-[auto_repeat(10,1fr)] gap-1 text-sm">
              {/* Time slots header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 font-bold text-center rounded-xl">
                TIME/DAY
              </div>
              {periods.map((period) => (
                <div 
                  key={period}
                  className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-3 font-semibold text-center rounded-lg border"
                >
                  {period}
                </div>
              ))}

              {/* Days and lessons */}
              {weekDays.map(day => (
                <React.Fragment key={day}>
                  <div 
                    className={`p-4 font-bold text-center rounded-xl border-2 transition-all duration-300 ${
                      day === getCurrentDay() 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-violet-400 shadow-lg transform scale-105' 
                        : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 text-slate-800 dark:text-slate-200 border-slate-300'
                    }`}
                  >
                    {day}
                  </div>
                  
                  {/* Render lessons with special handling for break/lunch periods */}
                  {teacherSchedule[day].map((lesson, periodIndex) => {
                    // Skip rendering cells for break and lunch indexes - they'll be rendered as vertical spans
                    if (BREAK_INDICES.includes(periodIndex) || periodIndex === LUNCH_INDEX) {
                      return null;
                    }
                    
                    return (
                      <div
                        key={`${day}-${periodIndex}`}
                        className={`p-3 text-center rounded-lg border transition-all duration-300 hover:scale-105 ${getLessonStyles(lesson, periodIndex, day)}`}
                      >
                        {lesson && (
                          <div className="flex flex-col items-center justify-center h-full relative">
                            <div className="font-bold text-xs mb-1 text-slate-800">{lesson.subject}</div>
                            <div className="text-[10px] text-slate-600">{lesson.grade} {lesson.stream}</div>
                            <div className="text-[10px] text-slate-500">{lesson.room}</div>
                            {renderLessonIndicators(lesson, periodIndex, day)}
                            {completedLessons.includes(lesson.id) && (
                              <div className="absolute -top-1 -right-1">
                                <CheckCircle2 className="h-4 w-4 text-green-500 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
              
              {/* Render vertical BREAK and LUNCH spans */}
              {BREAK_INDICES.map((breakIndex, i) => (
                <div 
                  key={`break-${i}`} 
                  className="row-start-2 col-start-[calc(3+2)] row-span-5 bg-green-100/80 dark:bg-green-900/20 rounded-lg border border-green-200 flex items-center justify-center"
                  style={{
                    gridColumnStart: breakIndex + 2, // +2 because of the day column and 1-based grid
                    gridRowStart: 2, // Start from the first day row
                    gridRowEnd: "span 5", // Span all 5 days
                  }}
                >
                  <VerticalBreak letters={BREAK_LETTERS} />
                </div>
              ))}
              
              {/* LUNCH column */}
              <div 
                className="row-start-2 col-start-[calc(9+2)] row-span-5 bg-amber-100/80 dark:bg-amber-900/20 rounded-lg border border-amber-200 flex items-center justify-center"
                style={{
                  gridColumnStart: LUNCH_INDEX + 2, // +2 because of the day column and 1-based grid
                  gridRowStart: 2, // Start from the first day row
                  gridRowEnd: "span 5", // Span all 5 days
                }}
              >
                <VerticalBreak letters={LUNCH_LETTERS} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Legend
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { color: "bg-gradient-to-r from-yellow-400 to-orange-500", label: "Current Class", icon: "🟡" },
              { color: "bg-gradient-to-r from-blue-400 to-indigo-500", label: "Next Class", icon: "🔵" },
              { color: "bg-gradient-to-r from-green-400 to-emerald-500", label: "Completed", icon: "✅" },
              { color: "bg-gradient-to-r from-purple-400 to-violet-500", label: "Break/Lunch", icon: "⏸️" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border">
                <div className={`w-4 h-4 ${item.color} rounded-full shadow-sm`} />
                <span className="text-xs font-medium">{item.icon} {item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}