import React from 'react';
import { Timer, CheckCircle2 } from 'lucide-react';

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

interface NextLessonInfo {
  lesson: TeacherLesson;
  startsIn: number;
  time: string;
  nextDay?: boolean;
  period: string;
  periodIndex: number;
  minutesUntil: number;
}

interface NextLessonPanelProps {
  nextLesson: NextLessonInfo | null;
  formatTimeUntil: (minutesUntil: number) => string;
}

const NextLessonPanel: React.FC<NextLessonPanelProps> = ({ nextLesson, formatTimeUntil }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl p-6 backdrop-blur-sm border-2 shadow-xl transition-all duration-500 mt-6 ${
      nextLesson 
        ? 'bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/30 shadow-secondary/20' 
        : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'
    }`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-full -translate-y-16 translate-x-16" />
    
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-secondary rounded-lg text-white shadow-lg">
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
            <div className="bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg p-3 shadow-md">
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
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckCircle2 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600">No more classes today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextLessonPanel; 