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
  );
};

export default TeacherTimetableHeader; 