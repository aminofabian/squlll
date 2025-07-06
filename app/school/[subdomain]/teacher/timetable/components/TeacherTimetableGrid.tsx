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
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <div className="w-0.5 h-4 bg-slate-400 rounded-full"></div>
        Weekly Schedule
      </h2>
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${periods.length}, 1fr)` }}>
          {/* Empty top-left corner */}
          <div className="p-3 bg-slate-50 border-r border-b border-slate-200"></div>
          
          {/* Period Headers */}
          {periods.map((period, periodIndex) => (
            <div key={`header-${periodIndex}`} className="p-3 text-center bg-slate-50 border-r border-b border-slate-200">
              <div className="text-xs font-medium text-slate-700 mb-1">{period}</div>
              <div className="text-[10px] text-slate-500 font-mono">P{periodIndex + 1}</div>
            </div>
          ))}
          
          {/* Day Rows */}
          {weekDays.map(day => (
            <React.Fragment key={`day-${day}`}>
              {/* Day Column Header */}
              <div className="p-3 font-medium text-slate-700 bg-slate-50 border-r border-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-800">{day}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {schedule[day]?.filter(lesson => lesson !== null).length || 0}
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
                      "p-2 border-r border-b border-slate-200 relative min-h-[80px] flex flex-col justify-center",
                      getLessonStyles(lesson, periodIndex, day)
                    )}
                  >
                    {lesson ? (
                      <div className="text-center space-y-1.5">
                        {/* Subject */}
                        <div className="font-semibold text-xs text-slate-900 leading-tight line-clamp-2">
                          {lesson.subject}
                        </div>
                        
                        {/* Class Info */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-2.5 h-2.5 text-slate-500" />
                            <span className="text-[10px] font-medium text-slate-600">{lesson.class}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-slate-500" />
                            <span className="text-[10px] text-slate-500">{lesson.room}</span>
                          </div>
                          {lesson.totalStudents && (
                            <div className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm inline-block">
                              {lesson.totalStudents}
                            </div>
                          )}
                        </div>
                        
                        {/* Indicators */}
                        <div className="flex items-center justify-center gap-0.5">
                          {renderLessonIndicators(lesson, periodIndex, day)}
                        </div>
                        
                        {/* Completed Check */}
                        {completedLessons.includes(lesson.id) && (
                          <div className="absolute top-1 right-1">
                            <div className="h-4 w-4 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200">
                              <CheckCircle2 className="h-2.5 w-2.5 text-slate-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 text-[10px] flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-4 h-4 bg-slate-100 rounded-sm flex items-center justify-center">
                            <Timer className="w-2 h-2" />
                          </div>
                          <span className="font-mono">Free</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div>
            <span className="text-slate-600">Current Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 border border-slate-400 rounded-sm"></div>
            <span className="text-slate-600">Next Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded-sm"></div>
            <span className="text-slate-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div>
            <span className="text-slate-600">Free Period</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherTimetableGrid; 