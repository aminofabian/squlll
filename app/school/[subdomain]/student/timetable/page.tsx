'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, CalendarDays, CheckCircle2, Timer, MapPin, UserCircle, Clock, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Lesson {
  id: string
  subject: string
  type?: 'CAS' | 'CORE' | 'LANG'
  completed?: boolean
  teacher?: string
  room?: string
}

const periods = [
  "8:20-8:55",
  "8:55-9:30",
  "9:30-9:50",
  "9:50-10:25",
  "10:25-11:00",
  "11:00-11:30",
  "11:30-12:05",
  "12:05-12:40",
  "12:40-2:00",
  "2:00-2:35"
]

const weekDays = ["MONDAY", "TUESDAY", "WED", "THURS", "FRIDAY"]

// CBC Lower Primary Timetable
const mockWeekSchedule: Record<string, (Lesson | 'BREAK' | 'LUNCH' | null)[]> = {
  "MONDAY": [
    { id: "mon-1", subject: "ENGLISH", type: "CORE", teacher: "Mrs. Johnson", room: "Room 12A" },
    { id: "mon-2", subject: "MATHS", type: "CORE", teacher: "Mr. Williams", room: "Room 14B" },
    'BREAK',
    { id: "mon-3", subject: "INDIG LANG", type: "LANG", teacher: "Mr. Omondi", room: "Language Lab" },
    { id: "mon-4", subject: "MOVEMENT", type: "CAS", teacher: "Mrs. Njeri", room: "Field" },
    'BREAK',
    { id: "mon-5", subject: "ENVIRONMENTAL ACTIVITIES", type: "CORE", teacher: "Dr. Otieno", room: "Science Lab" },
    { id: "mon-6", subject: "MOVEMENT", type: "CAS", teacher: "Mrs. Njeri", room: "Gymnasium" },
    'LUNCH',
    null
  ],
  "TUESDAY": [
    { id: "tue-1", subject: "MATHS", type: "CORE", teacher: "Mr. Williams", room: "Room 14B" },
    { id: "tue-2", subject: "KISWAHILI", type: "LANG", teacher: "Mrs. Wanjiku", room: "Room 10C" },
    'BREAK',
    { id: "tue-3", subject: "ENGLISH", type: "CORE", teacher: "Mrs. Johnson", room: "Room 12A" },
    { id: "tue-4", subject: "ENVIRONMENTAL ACTIVITIES", type: "CORE", teacher: "Dr. Otieno", room: "Science Lab" },
    'BREAK',
    { id: "tue-5", subject: "MUSIC", type: "CAS", teacher: "Mr. Kamau", room: "Music Room" },
    { id: "tue-6", subject: "RELIGIOUS EDUCATION", type: "CORE", teacher: "Mrs. Adhiambo", room: "Room 9B" },
    'LUNCH',
    null
  ],
  "WED": [
    { id: "wed-1", subject: "ENGLISH", type: "CORE", teacher: "Mrs. Johnson", room: "Room 12A" },
    { id: "wed-2", subject: "MATHS", type: "CORE", teacher: "Mr. Williams", room: "Room 14B" },
    'BREAK',
    { id: "wed-3", subject: "KISWAHILI", type: "LANG", teacher: "Mrs. Wanjiku", room: "Room 10C" },
    { id: "wed-4", subject: "MUSIC", type: "CAS", teacher: "Mr. Kamau", room: "Music Room" },
    'BREAK',
    { id: "wed-5", subject: "RELIGIOUS EDUCATION", type: "CORE", teacher: "Mrs. Adhiambo", room: "Room 9B" },
    { id: "wed-6", subject: "ENVIRONMENTAL ACTIVITIES", type: "CORE", teacher: "Dr. Otieno", room: "Science Lab" },
    'LUNCH',
    { id: "wed-7", subject: "INDIG LANG", type: "LANG", teacher: "Mr. Omondi", room: "Language Lab" },
  ],
  "THURS": [
    { id: "thu-1", subject: "MATHS", type: "CORE", teacher: "Mr. Williams", room: "Room 14B" },
    { id: "thu-2", subject: "KISWAHILI", type: "LANG", teacher: "Mrs. Wanjiku", room: "Room 10C" },
    'BREAK',
    { id: "thu-3", subject: "ENGLISH", type: "CORE", teacher: "Mrs. Johnson", room: "Room 12A" },
    { id: "thu-4", subject: "MUSIC", type: "CAS", teacher: "Mr. Kamau", room: "Music Room" },
    'BREAK',
    { id: "thu-5", subject: "ART & CRAFT", type: "CAS", teacher: "Ms. Akinyi", room: "Art Studio" },
    { id: "thu-6", subject: "RELIGIOUS EDUCATION", type: "CORE", teacher: "Mrs. Adhiambo", room: "Room 9B" },
    'LUNCH',
    { id: "thu-7", subject: "INDIG LANG", type: "LANG", teacher: "Mr. Omondi", room: "Language Lab" }
  ],
  "FRIDAY": [
    { id: "fri-1", subject: "PPI", type: "CORE", teacher: "Mr. Mutua", room: "Hall" },
    { id: "fri-2", subject: "ENGLISH", type: "CORE", teacher: "Mrs. Johnson", room: "Room 12A" },
    'BREAK',
    { id: "fri-3", subject: "MATHS", type: "CORE", teacher: "Mr. Williams", room: "Room 14B" },
    { id: "fri-4", subject: "KISWAHILI", type: "LANG", teacher: "Mrs. Wanjiku", room: "Room 10C" },
    'BREAK',
    { id: "fri-5", subject: "ENVIRONMENTAL ACTIVITIES", type: "CORE", teacher: "Dr. Otieno", room: "Science Lab" },
    { id: "fri-6", subject: "ART & CRAFT", type: "CAS", teacher: "Ms. Akinyi", room: "Art Studio" },
    'LUNCH',
    null
  ]
}

const lessonCounts = {
  "MATHEMATICS": 5,
  "ENGLISH": 5,
  "KISWAHILI": 4,
  "ENVIRONMENTAL": 4,
  "INDIGENOUS LANGUAGE": 2,
  "RELIGIOUS": 3,
  "MUSIC": 3,
  "ART & CRAFT": 2,
  "MOVEMENT": 2
}

// Constants for BREAK and LUNCH positions
const BREAK_INDICES = [2, 5]
const LUNCH_INDEX = 8
const BREAK_LETTERS = ['B', 'R', 'E', 'A', 'K']
const LUNCH_LETTERS = ['L', 'U', 'N', 'C', 'H']

// Vertical text component for BREAK and LUNCH
const VerticalBreak = ({ letters }: { letters: string[] }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {letters.map((letter, i) => (
        <div key={i} className="font-semibold">{letter}</div>
      ))}
    </div>
  )
}

export default function TimetablePage() {
  const currentDate = new Date()
  const currentTime = new Date('2025-06-25T14:45:35+03:00') // Using the latest provided time for consistent display
  
  // Demo data - completed lessons
  const [completedLessons, setCompletedLessons] = useState<string[]>([
    "mon-1", "mon-2", "mon-3", "tue-1"
  ])

  const getCurrentPeriod = () => {
    const now = currentTime
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTimeInMinutes = hours * 60 + minutes

    for (let i = 0; i < periods.length; i++) {
      const [start, end] = periods[i].split('-')
      
      // Parse start time
      let [startHour, startMinStr] = start.split(':')
      let startHourNum = parseInt(startHour)
      // Adjust hours for afternoon periods (after 12 PM)
      if (startHourNum < 8) { // If hour is like 1, 2, etc. (PM)
        startHourNum += 12
      }
      const startMin = parseInt(startMinStr || '0')
      
      // Parse end time
      let [endHour, endMinStr] = end.split(':')
      let endHourNum = parseInt(endHour)
      // Adjust hours for afternoon periods (after 12 PM)
      if (endHourNum < 8) { // If hour is like 1, 2, etc. (PM)
        endHourNum += 12
      }
      const endMin = parseInt(endMinStr || '0')
      
      const periodStartInMinutes = startHourNum * 60 + startMin
      const periodEndInMinutes = endHourNum * 60 + endMin

      if (currentTimeInMinutes >= periodStartInMinutes && currentTimeInMinutes < periodEndInMinutes) {
        return i
      }
    }
    // If current time is after the last period, return a code indicating that
    const lastPeriod = periods[periods.length - 1]
    const [_, lastEndTime] = lastPeriod.split('-')
    let [lastEndHour, lastEndMinStr] = lastEndTime.split(':')
    let lastEndHourNum = parseInt(lastEndHour)
    if (lastEndHourNum < 8) { // If hour is like 1, 2, etc. (PM)
      lastEndHourNum += 12
    }
    const lastEndMin = parseInt(lastEndMinStr || '0')
    const lastEndInMinutes = lastEndHourNum * 60 + lastEndMin
    
    if (currentTimeInMinutes >= lastEndInMinutes) {
      return -2; // Special code for after school hours
    }
    
    return -1; // Time is before first class or during a break
  }

  const getCurrentDay = (): string => {
    const day = currentTime.getDay()
    // 0 is Sunday, so we need to get the correct weekday
    if (day === 0) return weekDays[4] // Return Friday for Sunday (demo purposes)
    if (day === 6) return weekDays[4] // Return Friday for Saturday (demo purposes)
    return weekDays[day - 1] // Adjust for zero-based indexing
  }

  const findNextLesson = () => {
    const currentDay = getCurrentDay()
    const currentPeriod = getCurrentPeriod()
    
    // Check if we're after school hours (-2) or during regular school day
    if (currentPeriod === -2) {
      // We're after school hours, next lesson will be tomorrow
      const weekDayIndex = weekDays.indexOf(currentDay)
      if (weekDayIndex < weekDays.length - 1) {
        // There's a next school day this week
        const nextDay = weekDays[weekDayIndex + 1]
        const tomorrowSchedule = mockWeekSchedule[nextDay]
        for (let i = 0; i < tomorrowSchedule.length; i++) {
          const lesson = tomorrowSchedule[i]
          if (typeof lesson === 'object' && lesson !== null) {
            return {
              lesson,
              time: periods[i],
              nextDay: true,
              periodIndex: i,
              day: nextDay
            }
          }
        }
      }
      // If we're Friday after school hours or couldn't find a lesson for tomorrow
      return null;
    }
    
    // Regular school day - check remaining lessons today
    const todaySchedule = mockWeekSchedule[currentDay]
    if (todaySchedule) {
      for (let i = currentPeriod + 1; i < todaySchedule.length; i++) {
        const lesson = todaySchedule[i]
        if (typeof lesson === 'object' && lesson !== null) {
          return {
            lesson,
            startsIn: (i - currentPeriod) * 40, // Assuming 40 min periods
            time: periods[i],
            nextDay: false,
            periodIndex: i,
            day: currentDay
          }
        }
      }
    }
    
    // No more lessons today - check tomorrow
    const weekDayIndex = weekDays.indexOf(currentDay)
    if (weekDayIndex < weekDays.length - 1) {
      const nextDay = weekDays[weekDayIndex + 1]
      const tomorrowSchedule = mockWeekSchedule[nextDay]
      for (let i = 0; i < tomorrowSchedule.length; i++) {
        const lesson = tomorrowSchedule[i]
        if (typeof lesson === 'object' && lesson !== null) {
          return {
            lesson,
            time: periods[i],
            nextDay: true,
            periodIndex: i,
            day: nextDay
          }
        }
      }
    }
    
    return null
  }

  const findCurrentLesson = () => {
    const currentDay = getCurrentDay()
    const currentPeriod = getCurrentPeriod()
    
    // Handle after-school hours case
    if (currentPeriod === -2) {
      return null; // No current lesson after school hours
    }
    
    if (!currentDay) return null;
    
    const todaySchedule = mockWeekSchedule[currentDay]
    if (todaySchedule && currentPeriod >= 0 && currentPeriod < todaySchedule.length) {
      const lesson = todaySchedule[currentPeriod]
      if (typeof lesson === 'object' && lesson !== null) {
        return {
          lesson,
          time: periods[currentPeriod],
          remainingTime: 40 - (currentTime.getMinutes() % 40), // Minutes remaining in current period
          periodIndex: currentPeriod,
          day: currentDay
        }
      }
    }
    return null
  }

  // This line is now moved to where we calculate all lesson information before the return statement

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

  const getLessonStatus = (lesson: Lesson | 'BREAK' | 'LUNCH' | null, periodIndex: number, day: string) => {
    if (!lesson || typeof lesson === 'string') return 'break'
    if (completedLessons.includes(lesson.id)) return 'completed'
    if (getCurrentDay() === day && getCurrentPeriod() === periodIndex) return 'ongoing'
    if (getCurrentDay() === day && getCurrentPeriod() < periodIndex) return 'upcoming'
    return 'past'
  }

  const getLessonStyles = (lesson: Lesson | 'BREAK' | 'LUNCH' | null, periodIndex: number, day: string) => {
    if (!lesson) return 'bg-white dark:bg-slate-900'
    if (lesson === 'BREAK') return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
    if (lesson === 'LUNCH') return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold'

    // Style based on status
    const status = getLessonStatus(lesson, periodIndex, day)
    switch(status) {
      case 'ongoing':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'upcoming':
        return 'bg-white dark:bg-slate-800/50'
      case 'past':
        return 'bg-slate-50 dark:bg-slate-800/20'
      default:
        return 'bg-white dark:bg-slate-900'
    }
  }

  // Using the VerticalBreak component defined outside

  const getCompletedLessonsByType = () => {
    return {
      CORE: completedLessons.filter(id => {
        const [day, periodIndex] = id.split('-')
        const daySchedule = mockWeekSchedule[day.toUpperCase()]
        if (!daySchedule) return false
        const lesson = daySchedule[parseInt(periodIndex) - 1]
        return typeof lesson === 'object' && lesson?.type === 'CORE'
      }).length,
      CAS: completedLessons.filter(id => {
        const [day, periodIndex] = id.split('-')
        const daySchedule = mockWeekSchedule[day.toUpperCase()]
        if (!daySchedule) return false
        const lesson = daySchedule[parseInt(periodIndex) - 1]
        return typeof lesson === 'object' && lesson?.type === 'CAS'
      }).length,
      LANG: completedLessons.filter(id => {
        const [day, periodIndex] = id.split('-')
        const daySchedule = mockWeekSchedule[day.toUpperCase()]
        if (!daySchedule) return false
        const lesson = daySchedule[parseInt(periodIndex) - 1]
        return typeof lesson === 'object' && lesson?.type === 'LANG'
      }).length
    }
  }

  // Calculate the current and next lesson information
  const nextLesson = findNextLesson()
  const currentLesson = findCurrentLesson()
  const completedByType = getCompletedLessonsByType()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-primary/20">
        <div>
          <h1 className="text-2xl font-bold">CBC Lower Primary Timetable</h1>
          <p className="text-sm text-slate-600">
            {currentTime.toLocaleDateString('en-KE', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-lg">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-mono font-bold">
            {currentTime.toLocaleTimeString('en-KE')}
          </span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[auto_repeat(10,1fr)] text-sm">
          {/* Time slots header */}
          <div className="bg-primary/5 p-3 font-semibold text-center border-b border-r">
            TIME/DAY
          </div>
          {periods.map((period) => (
            <div 
              key={period}
              className="bg-primary/5 p-2 font-semibold text-center border-b border-r whitespace-nowrap"
            >
              {period}
            </div>
          ))}

          {/* Vertical BREAK columns */}
          {BREAK_INDICES.map((breakIndex, i) => (
            <div 
              key={`break-${i}`}
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b border-r"
              style={{
                gridColumnStart: breakIndex + 2,
                gridRowStart: 2,
                gridRowEnd: "span 5",
              }}
            >
              <VerticalBreak letters={BREAK_LETTERS} />
            </div>
          ))}

          {/* Vertical LUNCH column */}
          <div 
            className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-b border-r"
            style={{
              gridColumnStart: LUNCH_INDEX + 2,
              gridRowStart: 2,
              gridRowEnd: "span 5",
            }}
          >
            <VerticalBreak letters={LUNCH_LETTERS} />
          </div>

          {/* Days and lessons */}
          {weekDays.map(day => (
            <>
              <div 
                key={day}
                className={`p-3 font-semibold text-center border-b border-r ${
                  day === getCurrentDay() ? 'bg-primary/10 text-primary' : 'bg-primary/5'
                }`}
              >
                {day}
              </div>
              {mockWeekSchedule[day].map((lesson, periodIndex) => {
                // Skip rendering individual BREAK and LUNCH cells
                if (BREAK_INDICES.includes(periodIndex) || periodIndex === LUNCH_INDEX) return null;
                
                return (
                  <div
                    key={`${day}-${periodIndex}`}
                    className={`p-2 text-center border-b border-r ${getLessonStyles(lesson, periodIndex, day)}`}
                  >
                    {lesson && typeof lesson !== 'string' && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-medium text-xs">{lesson.subject}</div>
                        {lesson.type === 'CAS' && (
                          <div className="text-[10px] text-primary">(CAS)</div>
                        )}
                        <div className="text-[9px] text-slate-500 truncate max-w-full">{lesson.teacher}</div>
                        {getCurrentDay() === day && 
                         getCurrentPeriod() === periodIndex && 
                         !completedLessons.includes(lesson.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 text-xs py-0 h-6"
                            onClick={() => setCompletedLessons(prev => [...prev, lesson.id])}
                          >
                            Complete
                          </Button>
                        )}
                        {completedLessons.includes(lesson.id) && (
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-1" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Current and Next Lesson Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Lesson */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10 dark:to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Current Lesson</h3>
            </div>
            {currentLesson && (
              <span className="text-sm px-2 py-1 bg-yellow-100 dark:bg-yellow-800/30 rounded-md flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                {currentLesson.remainingTime} min left
              </span>
            )}
          </div>

          {currentLesson ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-medium">{currentLesson.lesson.subject}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{currentLesson.time}</p>
                </div>
                {!completedLessons.includes(currentLesson.lesson.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setCompletedLessons(prev => [...prev, currentLesson.lesson.id])}
                  >
                    Mark Complete
                  </Button>
                )}
                {completedLessons.includes(currentLesson.lesson.id) && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded-md text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-4 w-4 text-slate-500" />
                  <span>{currentLesson.lesson.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span>{currentLesson.lesson.room}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 border-dashed border-2 border-slate-200 dark:border-slate-700 rounded-md">
              <p className="text-sm text-slate-500 dark:text-slate-400">No active lesson</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Break or lunch time</p>
            </div>
          )}
        </div>

        {/* Next Lesson */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Next Lesson</h3>
            </div>
            {nextLesson && !nextLesson.nextDay && (
              <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-800/30 rounded-md flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                In {nextLesson.startsIn} min
              </span>
            )}
          </div>

          {nextLesson ? (
            <div className="space-y-3">
              <div>
                <p className="text-xl font-medium">{nextLesson.lesson.subject}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {nextLesson.nextDay ? `Tomorrow at ${nextLesson.time}` : nextLesson.time}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-4 w-4 text-slate-500" />
                  <span>{nextLesson.lesson.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span>{nextLesson.lesson.room}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 border-dashed border-2 border-slate-200 dark:border-slate-700 rounded-md">
              <p className="text-sm text-slate-500 dark:text-slate-400">No more lessons today</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Enjoy your free time!</p>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Today's Progress */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Today's Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Core Subjects</span>
              <span className="font-medium">{completedByType.CORE} completed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Creative Arts</span>
              <span className="font-medium">{completedByType.CAS} completed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Languages</span>
              <span className="font-medium">{completedByType.LANG} completed</span>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Weekly Lessons</h3>
          </div>
          <div className="space-y-2 text-sm">
            {Object.entries(lessonCounts).map(([subject, count]) => (
              <div key={subject} className="flex justify-between">
                <span>{subject}</span>
                <span className="font-medium">{count} lessons</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-50 dark:bg-yellow-900/20" />
          <span>Current Lesson</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 dark:bg-green-900/20" />
          <span>Completed / Lunch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/20" />
          <span>Break</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>Marked Complete</span>
        </div>
      </div>
    </div>
  )
}