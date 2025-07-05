import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Conflict {
  teacher: string;
  conflictingClasses: Array<{
    grade: string;
    cellKey: string;
    subject: string;
  }>;
}

interface ConflictsPanelProps {
  conflicts: Record<string, Conflict>;
  timeSlots: Array<{ id: number; time: string; color: string }>;
  days: Array<{ name: string; color: string }>;
  onClearCell: (cellKey: string) => void;
}

export const ConflictsPanel: React.FC<ConflictsPanelProps> = ({
  conflicts,
  timeSlots,
  days,
  onClearCell
}) => {
  if (Object.keys(conflicts).length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Teacher Scheduling Conflicts
      </h3>
      <div className="space-y-3">
        {Object.entries(conflicts).map(([cellKey, conflict]) => {
          const [grade, timeId, dayIndex] = cellKey.split('-');
          const timeSlot = timeSlots.find(t => t.id === parseInt(timeId));
          const day = days[parseInt(dayIndex)];
          
          return (
            <div key={cellKey} className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-red-800">{conflict.teacher}</span>
                  <span className="text-red-600 ml-2">has conflicts at {timeSlot?.time} on {day?.name}</span>
                </div>
                <button
                  onClick={() => onClearCell(cellKey)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-sm text-red-600">
                Conflicting classes: {conflict.conflictingClasses.map(c => c.grade).join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 