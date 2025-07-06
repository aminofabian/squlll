import React from 'react';
import { Clock, CalendarDays } from 'lucide-react';

interface TeacherTimetableHeaderProps {
  currentTime: Date;
}

const TeacherTimetableHeader: React.FC<TeacherTimetableHeaderProps> = ({ currentTime }) => {
  const formatCurrentTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="mb-8 flex justify-between items-center">
      <div className="flex gap-2 items-center text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
        <CalendarDays className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium text-slate-700">Term 2, 2025</span>
      </div>
      
      <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-xl border-2 border-primary/20 shadow-md">
        <Clock className="h-5 w-5 text-primary" />
        <div>
          <div className="text-xl font-bold text-primary">
            {formatCurrentTime(currentTime)}
          </div>
          <div className="text-xs text-primary/70">
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetableHeader; 