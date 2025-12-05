import React from 'react';
import { Clock, CheckCircle2, Timer } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TeacherLesson {
  id: string;
  subject: string;
  room: string;
  class: string;
  grade?: string;
  stream?: string;
  day: string;
  period: number;
  totalStudents?: number;
  completed?: boolean;
}

interface TimeSlot {
  id: string;
  periodNumber: number;
  displayTime: string;
  startTime: string;
  endTime: string;
}

interface TimetableBreak {
  id: string;
  name: string;
  type: string;
  dayOfWeek: number;
  afterPeriod: number;
  durationMinutes: number;
  icon: string;
}

interface TeacherTimetableGridProps {
  schedule: Record<string, (TeacherLesson | null)[]>;
  periods: string[];
  weekDays: string[];
  completedLessons: string[];
  getLessonStyles: (lesson: TeacherLesson | null, periodIndex: number, day: string) => string;
  renderLessonIndicators: (lesson: TeacherLesson, periodIndex: number, day: string) => React.ReactNode;
  timeSlots: TimeSlot[];
  breaks: TimetableBreak[];
  dayNames: string[];
}

const TeacherTimetableGrid: React.FC<TeacherTimetableGridProps> = ({
  schedule,
  periods,
  weekDays,
  completedLessons,
  getLessonStyles,
  renderLessonIndicators,
  timeSlots,
  breaks,
  dayNames
}) => {
  // Sort time slots by period number
  const sortedTimeSlots = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
  
  // Map day names to day indices (MONDAY = 1, TUESDAY = 2, etc.)
  const dayNameToIndex: Record<string, number> = {
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
  };

  // Create a map of timeSlot ID to period index for quick lookup
  const timeSlotToIndex = new Map<string, number>();
  sortedTimeSlots.forEach((slot, index) => {
    timeSlotToIndex.set(slot.id, index);
  });

  // Helper to get lesson for a specific day and time slot
  const getLessonForDayAndSlot = (day: string, slotId: string): TeacherLesson | null => {
    const periodIndex = timeSlotToIndex.get(slotId);
    if (periodIndex === undefined) return null;
    return schedule[day]?.[periodIndex] || null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
              <th className="border-r border-slate-200 dark:border-slate-600 p-4 text-left font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Time</span>
                </div>
              </th>
              {weekDays.map((day, index) => (
                <th key={index} className="border-r border-slate-200 dark:border-slate-600 last:border-r-0 p-4 text-left font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTimeSlots.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-b border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium">No time slots available</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedTimeSlots.map((slot, slotIndex) => {
                // Get breaks that come after this period (for Monday as reference)
                const breaksAfterThisPeriod = breaks.filter(
                  (b) => b.afterPeriod === slot.periodNumber && b.dayOfWeek === 1
                );

                // Alternate row colors for better readability
                const isEven = slotIndex % 2 === 0;

                return (
                  <React.Fragment key={slot.id}>
                    {/* Regular lesson row */}
                    <tr className={cn(
                      "group transition-colors",
                      isEven 
                        ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750' 
                        : 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-750'
                    )}>
                      <td className="border-r border-b border-slate-200 dark:border-slate-700 p-0">
                        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-r-2 border-primary/20 dark:border-primary/30 p-4 min-w-[140px]">
                          <div className="flex flex-col gap-2">
                            {/* Time Display */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30">
                                <Clock className="h-4 w-4 text-primary dark:text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                                  {slot.displayTime}
                                </div>
                                <div className="text-xs font-semibold text-primary dark:text-primary-foreground mt-0.5">
                                  Period {slot.periodNumber}
                                </div>
                              </div>
                            </div>
                            
                            {/* Time Range */}
                            {slot.startTime && slot.endTime && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pl-10">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {weekDays.map((day, dayIndex) => {
                        const lesson = getLessonForDayAndSlot(day, slot.id);
                        const dayOfWeek = dayNameToIndex[day] || dayIndex + 1;
                        
                        return (
                          <td key={dayIndex} className="border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 p-3 align-top">
                            {lesson ? (
                              <div 
                                className={cn(
                                  "group/lesson relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200",
                                  completedLessons.includes(lesson.id) && "opacity-75"
                                )}
                              >
                                <div className="space-y-1.5">
                                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                                    {lesson.subject}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">{lesson.class}</span>
                                  </div>
                                  {lesson.room && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-600">
                                      <span>📍</span>
                                      <span>Room {lesson.room}</span>
                                    </div>
                                  )}
                                  {lesson.totalStudents && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                      {lesson.totalStudents} students
                                    </div>
                                  )}
                                </div>
                                
                                {/* Indicators */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                  {renderLessonIndicators(lesson, slotIndex, day)}
                                  {completedLessons.includes(lesson.id) && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full min-h-[80px] flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                <span className="font-medium">Free</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Break rows (if any after this period) */}
                    {breaksAfterThisPeriod.length > 0 && (
                      <tr className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20 border-y-2 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-950/30 dark:hover:to-amber-950/30 transition-colors">
                        <td className="border-r border-b border-orange-200 dark:border-orange-800 p-0">
                          <div className="relative bg-gradient-to-br from-orange-100/50 via-orange-50/30 to-transparent dark:from-orange-900/30 dark:via-orange-950/20 border-r-2 border-orange-300 dark:border-orange-700 p-4 min-w-[140px]">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-200 dark:bg-orange-900 text-lg">
                                {breaksAfterThisPeriod[0].icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-sm text-orange-900 dark:text-orange-200">
                                  {breaksAfterThisPeriod[0].name}
                                </div>
                                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mt-0.5">
                                  {breaksAfterThisPeriod[0].durationMinutes} min
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        {weekDays.map((day, dayIndex) => {
                          const dayOfWeek = dayNameToIndex[day] || dayIndex + 1;
                          const dayBreak = breaksAfterThisPeriod.find(
                            (b) => b.dayOfWeek === dayOfWeek
                          );
                          return (
                            <td key={dayIndex} className="border-r border-b border-orange-200 dark:border-orange-800 last:border-r-0 p-3 text-center align-middle">
                              {dayBreak ? (
                                <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                  <span className="text-lg">{dayBreak.icon}</span>
                                  <span className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                                    {dayBreak.durationMinutes}min
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full h-full min-h-[60px] flex items-center justify-center text-xs text-orange-400 dark:text-orange-500 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-lg">
                                  <span className="font-medium">No Break</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherTimetableGrid;
