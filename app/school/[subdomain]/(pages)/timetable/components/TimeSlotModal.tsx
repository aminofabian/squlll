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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add New Time Slot</h2>
              <p className="text-sm text-white/80">Set the time period for this slot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Start Time</label>
              <div className="flex gap-2">
                <select
                  value={timeSlotData.startHour}
                  onChange={(e) => onTimeSlotDataChange('startHour', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className="text-gray-500 self-center font-medium">:</span>
                <select
                  value={timeSlotData.startMinute}
                  onChange={(e) => onTimeSlotDataChange('startMinute', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">End Time</label>
              <div className="flex gap-2">
                <select
                  value={timeSlotData.endHour}
                  onChange={(e) => onTimeSlotDataChange('endHour', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className="text-gray-500 self-center font-medium">:</span>
                <select
                  value={timeSlotData.endMinute}
                  onChange={(e) => onTimeSlotDataChange('endMinute', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-500 mb-2 font-medium">Preview</div>
              <div className="text-lg font-semibold text-gray-800 text-center">
                {timeSlotData.startHour}:{timeSlotData.startMinute} {timeSlotData.startPeriod} – {timeSlotData.endHour}:{timeSlotData.endMinute} {timeSlotData.endPeriod}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Time Slot
          </button>
        </div>
      </div>
    </div>
  );
}; 