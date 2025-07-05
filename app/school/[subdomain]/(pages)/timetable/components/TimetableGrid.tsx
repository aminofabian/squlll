import React from 'react';
import { Clock, Edit3, AlertTriangle, Save, X, Coffee, Plus } from 'lucide-react';

interface Teacher {
  id: number;
  subjects: string[];
  color: string;
}

interface CellData {
  subject: string;
  teacher: string;
  isBreak?: boolean;
  breakType?: string;
}

interface TimeSlot {
  id: number;
  time: string;
  color: string;
}

interface Break {
  id: string;
  name: string;
  type: 'lunch' | 'recess' | 'break' | 'assembly' | 'custom';
  color: string;
  icon: string;
}

interface TimetableGridProps {
  selectedGrade: string;
  subjects: Record<string, CellData>;
  teachers: Record<string, Teacher>;
  breaks: Break[];
  conflicts: Record<string, any>;
  days: Array<{ name: string; color: string }>;
  timeSlots: TimeSlot[];
  editingCell: string | null;
  editingTimeSlot: number | null;
  inputValue: string;
  selectedTeacher: string;
  timeSlotEditValue: string;
  isAddingTimeSlot: boolean;
  newTimeSlotValue: string;
  showTimeSlotSuccess: boolean;
  newTimeSlotData: {
    startHour: string;
    startMinute: string;
    startPeriod: string;
    endHour: string;
    endMinute: string;
    endPeriod: string;
  };
  onCellClick: (timeId: number, dayIndex: number) => void;
  onTimeSlotClick: (timeId: number) => void;
  onInputChange: (value: string) => void;
  onTimeSlotEditChange: (value: string) => void;
  onTeacherChange: (teacher: string) => void;
  onInputSubmit: () => void;
  onTimeSlotSave: (timeId: number) => void;
  onCancelEdit: () => void;
  onCancelTimeSlotEdit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onTimeSlotKeyPress: (e: React.KeyboardEvent) => void;
  onAddBreak: (cellKey: string, breakName: string) => void;
  onStartAddTimeSlot: () => void;
  onAddTimeSlot: () => void;
  onNewTimeSlotChange: (value: string) => void;
  onNewTimeSlotKeyPress: (e: React.KeyboardEvent) => void;
  onCancelAddTimeSlot: () => void;
  onNewTimeSlotDataChange: (field: string, value: string) => void;
  getCellKey: (grade: string, timeId: number, dayIndex: number) => string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  selectedGrade,
  subjects,
  teachers,
  breaks,
  conflicts,
  days,
  timeSlots,
  editingCell,
  editingTimeSlot,
  inputValue,
  selectedTeacher,
  timeSlotEditValue,
  isAddingTimeSlot,
  newTimeSlotValue,
  showTimeSlotSuccess,
  newTimeSlotData,
  onCellClick,
  onTimeSlotClick,
  onInputChange,
  onTimeSlotEditChange,
  onTeacherChange,
  onInputSubmit,
  onTimeSlotSave,
  onCancelEdit,
  onCancelTimeSlotEdit,
  onKeyPress,
  onTimeSlotKeyPress,
  onAddBreak,
  onStartAddTimeSlot,
  onAddTimeSlot,
  onNewTimeSlotChange,
  onNewTimeSlotKeyPress,
  onCancelAddTimeSlot,
  onNewTimeSlotDataChange,
  getCellKey
}) => {
  const getBreakInfo = (subject: string): Break | null => {
    return breaks.find(breakItem => breakItem.name.toLowerCase() === subject.toLowerCase()) || null;
  };

  const timeSlotColors = [
    'border-l-primary',
    'border-l-emerald-600',
    'border-l-amber-500',
    'border-l-sky-500',
    'border-l-orange-500',
    'border-l-green-600'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Day Headers */}
      <div className="grid grid-cols-6 gap-0">
        <div className="bg-primary p-4 flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        
        {days.map((day, index) => (
          <div
            key={index}
            className={`${day.color} text-white p-4 text-center font-semibold text-lg transform -skew-x-12`}
          >
            <div className="transform skew-x-12">
              {day.name}
            </div>
          </div>
        ))}
      </div>

              {/* Time slots and cells */}
        {timeSlots.map((slot, index) => (
          <div 
            key={slot.id} 
            className={`grid grid-cols-6 gap-0 border-b border-gray-200 last:border-b-0 transition-all duration-300 ${
              index === timeSlots.length - 1 && showTimeSlotSuccess ? 'bg-green-50/30 shadow-lg' : ''
            }`} 
            data-time-slot-id={slot.id}
          >
            <div 
              className={`p-4 border-l-4 ${slot.color} flex items-center cursor-pointer hover:bg-gray-100 transition-colors relative group ${
                index === timeSlots.length - 1 && showTimeSlotSuccess ? 'bg-green-50/50' : 'bg-gray-50'
              }`}
              onClick={() => onTimeSlotClick(slot.id)}
              title="Click to edit time slot"
            >
              {editingTimeSlot === slot.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={timeSlotEditValue}
                    onChange={(e) => onTimeSlotEditChange(e.target.value)}
                    onKeyDown={onTimeSlotKeyPress}
                    className="flex-1 border-2 border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-gray-800"
                    placeholder="Enter time..."
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimeSlotSave(slot.id);
                    }}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelTimeSlotEdit();
                    }}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-700 flex-1">
                    {slot.time}
                  </div>
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </div>
                </>
              )}
            </div>

          {days.map((day, dayIndex) => {
            const cellKey = getCellKey(selectedGrade, slot.id, dayIndex);
            const isEditing = editingCell === cellKey;
            const cellData = subjects[cellKey];
            const hasConflict = conflicts[cellKey];
            const teacher = cellData?.teacher ? teachers[cellData.teacher] : null;
            const breakInfo = cellData ? getBreakInfo(cellData.subject) : null;
            const isBreak = cellData?.isBreak || breakInfo;
            

            


            return (
              <div
                key={dayIndex}
                className={`border-r border-gray-200 last:border-r-0 min-h-[100px] relative group ${
                  hasConflict ? 'bg-red-50 border-red-200' : ''
                } ${isBreak ? 'bg-gradient-to-br from-gray-50 to-gray-100' : ''}`}
              >
                {isEditing ? (
                  <div className="p-3 h-full">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => onInputChange(e.target.value)}
                      onKeyDown={onKeyPress}
                      className="w-full border-2 border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2 bg-white text-gray-800"
                      placeholder="Subject name or break..."
                      autoFocus
                    />
                    <select
                      value={selectedTeacher}
                      onChange={(e) => onTeacherChange(e.target.value)}
                      className="w-full border-2 border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-gray-800"
                    >
                      <option value="">Select Teacher</option>
                      {Object.entries(teachers).map(([name, teacher]) => (
                        <option key={name} value={name}>
                          {name} ({teacher.subjects.join(', ')})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={onInputSubmit}
                        className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-3 h-full cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex flex-col justify-center relative"
                    onClick={() => onCellClick(slot.id, dayIndex)}
                  >
                    {cellData ? (
                      <div className="text-center">
                        {isBreak ? (
                          <div className="flex flex-col items-center">
                            <div className={`text-lg mb-1 ${breakInfo?.color.replace('bg-', 'text-')}`}>
                              {breakInfo?.icon || '☕'}
                            </div>
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              {cellData.subject}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${breakInfo?.color} text-white`}>
                              {breakInfo?.type || 'Break'}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-800 mb-1">
                              {cellData.subject}
                            </div>
                            {teacher && (
                              <div className={`text-xs px-2 py-1 rounded-full ${teacher.color}`}>
                                {cellData.teacher}
                              </div>
                            )}
                          </>
                        )}
                        {hasConflict && (
                          <div className="absolute top-1 right-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm">
                        Click to add class
                      </div>
                    )}
                    
                    {/* Break Quick Add Buttons */}
                    {!cellData && (
                      <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-1 justify-center">
                          {breaks.slice(0, 3).map((breakItem) => (
                            <button
                              key={breakItem.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddBreak(cellKey, breakItem.name);
                              }}
                              className={`p-1 rounded text-xs ${breakItem.color} text-white hover:opacity-80 transition-opacity`}
                              title={`Add ${breakItem.name}`}
                            >
                              {breakItem.icon}
                            </button>
                          ))}
                          {breaks.length > 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCellClick(slot.id, dayIndex);
                              }}
                              className="p-1 rounded text-xs bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                              title="More options"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Add Time Slot Row */}
      <div className="grid grid-cols-6 gap-0 border-t-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="p-4 border-l-4 border-l-primary/50 flex items-center relative group">
          <div 
            className="flex items-center justify-center w-full cursor-pointer hover:bg-primary/10 transition-all duration-200 p-4 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/50 group"
            onClick={onStartAddTimeSlot}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
                  Add Time Slot
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Click to add new period
                </div>
              </div>
            </div>
          </div>
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="border-r border-gray-200 last:border-r-0 min-h-[80px] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative group"
          >
            <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="text-xs text-gray-400">New slot</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 