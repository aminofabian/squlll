import React from 'react';
import { X, Clock, Plus } from 'lucide-react';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  timeSlotData: {
    startHour: string;
    startMinute: string;
    startPeriod: string;
    endHour: string;
    endMinute: string;
    endPeriod: string;
  };
  onTimeSlotDataChange: (field: string, value: string) => void;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  timeSlotData,
  onTimeSlotDataChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 shadow-2xl max-w-md w-full mx-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add New Time Slot</h2>
              <p className="text-sm text-white/80">Set the time period for this slot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 transition-colors rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex-1">
          <div className="space-y-5">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Time</label>
              <div className="flex gap-2">
                <select
                  value={timeSlotData.startHour}
                  onChange={(e) => onTimeSlotDataChange('startHour', e.target.value)}
                  className="flex-1 border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-10"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 self-center font-medium">:</span>
                <select
                  value={timeSlotData.startMinute}
                  onChange={(e) => onTimeSlotDataChange('startMinute', e.target.value)}
                  className="flex-1 border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-10"
                >
                  {Array.from({length: 60}, (_, i) => i).map(minute => (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={timeSlotData.startPeriod}
                  onChange={(e) => onTimeSlotDataChange('startPeriod', e.target.value)}
                  className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-10"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End Time</label>
              <div className="flex gap-2">
                <select
                  value={timeSlotData.endHour}
                  onChange={(e) => onTimeSlotDataChange('endHour', e.target.value)}
                  className="flex-1 border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-10"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 self-center font-medium">:</span>
                <select
                  value={timeSlotData.endMinute}
                  onChange={(e) => onTimeSlotDataChange('endMinute', e.target.value)}
                  className="flex-1 border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-10"
                >
                  {Array.from({length: 60}, (_, i) => i).map(minute => (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={timeSlotData.endPeriod}
                  onChange={(e) => onTimeSlotDataChange('endPeriod', e.target.value)}
                  className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-10"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-300 dark:border-slate-600">
              <div className="text-xs text-slate-500 mb-2 font-medium">Preview</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center">
                {timeSlotData.startHour}:{timeSlotData.startMinute} {timeSlotData.startPeriod} – {timeSlotData.endHour}:{timeSlotData.endMinute} {timeSlotData.endPeriod}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 flex gap-3 border-t border-slate-300 dark:border-slate-600">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            className="flex-1 px-4 py-2 bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 h-10 rounded"
          >
            <Plus className="w-4 h-4" />
            Add Time Slot
          </button>
        </div>
      </div>
    </div>
  );
}; 