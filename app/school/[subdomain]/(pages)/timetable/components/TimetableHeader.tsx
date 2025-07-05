import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';

interface TimetableHeaderProps {
  totalConflicts: number;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({ totalConflicts }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Smart School Timetable
      </h1>
      <div className="flex items-center justify-center gap-4 text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>Teacher Conflict Detection</span>
        </div>
        {totalConflicts > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{totalConflicts} Conflicts Found</span>
          </div>
        )}
      </div>
    </div>
  );
}; 