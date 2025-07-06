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
      <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Weekly Schedule
      </h2>
      
      <div className="grid gap-3 mt-6 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden" 
           style={{ gridTemplateColumns: `220px repeat(${periods.length}, 1fr)` }}>
        {/* Empty top-left corner */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-b border-slate-200"></div>
        
        {/* Period Headers */}
        {periods.map((period, periodIndex) => (
          <div key={`header-${periodIndex}`} className="p-4 text-center font-semibold bg-gradient-to-br from-primary/5 to-primary/10 border-b border-slate-200 text-slate-700">
            <div className="text-sm font-bold text-primary">{period}</div>
            <div className="text-xs text-slate-500 mt-1">Period {periodIndex + 1}</div>
          </div>
        ))}
        
        {/* Day Rows */}
        {weekDays.map(day => (
          <React.Fragment key={`day-${day}`}>
            {/* Day Column Header */}
            <div className="p-4 font-semibold text-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-primary">{day}</div>
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
                    "p-4 border-r border-b border-slate-200 relative min-h-[140px] flex flex-col justify-center rounded-none",
                    getLessonStyles(lesson, periodIndex, day)
                  )}
                >
                  {lesson ? (
                    <div className="text-center space-y-3">
                      {/* Subject */}
                      <div className="font-bold text-sm text-slate-900 leading-tight">
                        {lesson.subject}
                      </div>
                      
                      {/* Class Info */}
                      <div className="text-xs text-slate-600 space-y-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span className="font-medium">{lesson.class}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-secondary" />
                          <span>{lesson.room}</span>
                        </div>
                        {lesson.totalStudents && (
                          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block">
                            {lesson.totalStudents} students
                          </div>
                        )}
                      </div>
                      
                      {/* Indicators */}
                      <div className="flex items-center justify-center gap-1">
                        {renderLessonIndicators(lesson, periodIndex, day)}
                      </div>
                      
                      {/* Completed Check */}
                      {completedLessons.includes(lesson.id) && (
                        <div className="absolute top-3 right-3">
                          <div className="h-7 w-7 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-success">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <Timer className="w-4 h-4" />
                        </div>
                        <span>Free Period</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/15 border-2 border-primary rounded-md"></div>
            <span className="font-medium">Current Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary/15 border-2 border-secondary rounded-md"></div>
            <span className="font-medium">Next Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/10 border-2 border-success/30 rounded-md"></div>
            <span className="font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 border-2 border-slate-300 rounded-md"></div>
            <span className="font-medium">Free Period</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherTimetableGrid; 