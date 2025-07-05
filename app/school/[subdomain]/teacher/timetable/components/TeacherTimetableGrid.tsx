import React from 'react';
import { CheckCircle2, Timer, Users, MapPin } from 'lucide-react';
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

interface TeacherTimetableGridProps {
  schedule: Record<string, (TeacherLesson | null)[]>;
  periods: string[];
  weekDays: string[];
  completedLessons: string[];
  getLessonStyles: (lesson: TeacherLesson | null, periodIndex: number, day: string) => string;
  renderLessonIndicators: (lesson: TeacherLesson, periodIndex: number, day: string) => React.ReactNode;
}

const TeacherTimetableGrid: React.FC<TeacherTimetableGridProps> = ({
  schedule,
  periods,
  weekDays,
  completedLessons,
  getLessonStyles,
  renderLessonIndicators
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-[#246a59] mb-4">Weekly Schedule</h2>
      
      <div className="grid gap-2 mt-4 bg-white rounded-lg border shadow-sm overflow-hidden" 
           style={{ gridTemplateColumns: `200px repeat(${periods.length}, 1fr)` }}>
        {/* Empty top-left corner */}
        <div className="p-4 bg-slate-50 border-r border-b border-slate-200"></div>
        
        {/* Period Headers */}
        {periods.map((period, periodIndex) => (
          <div key={`header-${periodIndex}`} className="p-4 text-center font-semibold bg-slate-50 border-b border-slate-200 text-slate-700">
            <div className="text-sm font-bold">{period}</div>
            <div className="text-xs text-slate-500 mt-1">Period {periodIndex + 1}</div>
          </div>
        ))}
        
        {/* Day Rows */}
        {weekDays.map(day => (
          <React.Fragment key={`day-${day}`}>
            {/* Day Column Header */}
            <div className="p-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold">{day}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {schedule[day]?.filter(lesson => lesson !== null).length || 0} classes
                </div>
              </div>
            </div>
            
            {/* Lesson Cells for this Day */}
            {periods.map((period, periodIndex) => {
              const lesson = schedule[day]?.[periodIndex];
              return (
                <div 
                  key={`${day}-${periodIndex}`}
                  className={cn(
                    "p-3 border-r border-b border-slate-200 relative min-h-[120px] flex flex-col justify-center",
                    getLessonStyles(lesson, periodIndex, day)
                  )}
                >
                  {lesson ? (
                    <div className="text-center space-y-2">
                      {/* Subject */}
                      <div className="font-bold text-sm text-slate-900">
                        {lesson.subject}
                      </div>
                      
                      {/* Class Info */}
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{lesson.class}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{lesson.room}</span>
                        </div>
                        {lesson.totalStudents && (
                          <div className="text-xs text-slate-500">
                            {lesson.totalStudents} students
                          </div>
                        )}
                      </div>
                      
                      {/* Indicators */}
                      <div className="flex items-center justify-center">
                        {renderLessonIndicators(lesson, periodIndex, day)}
                      </div>
                      
                      {/* Completed Check */}
                      {completedLessons.includes(lesson.id) && (
                        <div className="absolute top-2 right-2">
                          <div className="h-6 w-6 bg-white rounded-full shadow-sm flex items-center justify-center border border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      Free Period
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 border border-primary rounded"></div>
            <span>Current Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#246a59]/20 border border-[#246a59] rounded"></div>
            <span>Next Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></div>
            <span>Free Period</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherTimetableGrid; 