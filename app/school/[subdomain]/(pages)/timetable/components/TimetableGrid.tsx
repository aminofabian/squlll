import React, { useState, useEffect } from 'react';
import { Clock, Edit3, AlertTriangle, Save, X, Coffee, Plus, ChevronLeft, ChevronRight, Calendar, User, BookOpen, GraduationCap, ChevronDown, Check, Star, Users, Zap, Timer } from 'lucide-react';

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
  onGradeSelect?: (grade: string) => void;
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
  onGradeSelect,
  getCellKey
}) => {
  const [mobileViewDay, setMobileViewDay] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  const grades = [
    'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && mobileViewDay < days.length - 1) {
      setMobileViewDay(prev => prev + 1);
    }
    if (isRightSwipe && mobileViewDay > 0) {
      setMobileViewDay(prev => prev - 1);
    }
  };

  const nextDay = () => {
    setMobileViewDay((prev) => (prev + 1) % days.length);
  };

  const prevDay = () => {
    setMobileViewDay((prev) => (prev - 1 + days.length) % days.length);
  };

  const getTimeOfDay = (timeString: string): string => {
    const hour = parseInt(timeString.split(':')[0]);
    if (hour < 10) return 'Early Morning';
    if (hour < 12) return 'Morning';
    if (hour < 15) return 'Afternoon';
    if (hour < 17) return 'Late Afternoon';
    return 'Evening';
  };

  // Handle grade selection
  const handleGradeSelect = (grade: string) => {
    if (onGradeSelect) {
      onGradeSelect(grade);
    }
    setShowGradeDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowGradeDropdown(false);
    };

    if (showGradeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showGradeDropdown]);

  // Calculate day statistics
  const getDayStats = (dayIndex: number) => {
    let totalSlots = timeSlots.length;
    let filledSlots = 0;
    let hasConflicts = false;

    timeSlots.forEach(slot => {
      const cellKey = getCellKey(selectedGrade, slot.id, dayIndex);
      if (subjects[cellKey]) {
        filledSlots++;
      }
      if (conflicts[cellKey]) {
        hasConflicts = true;
      }
    });

    return { totalSlots, filledSlots, hasConflicts };
  };

  // Mobile Layout - Timeline Style Design
  if (isMobileView) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 w-full max-w-full overflow-hidden">
        {/* Header - Clean and Minimal */}
        <div className="flex-shrink-0 bg-white shadow-sm">
          {/* Grade Selection - Compact */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGradeDropdown(!showGradeDropdown);
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 text-sm"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{selectedGrade}</span>
                  <span className="text-xs text-gray-500">
                    ({(() => {
                      const stats = getDayStats(mobileViewDay);
                      return `${Math.round((stats.filledSlots / stats.totalSlots) * 100)}%`;
                    })()})
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showGradeDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 shadow-lg max-h-40 overflow-y-auto">
                  {grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGradeSelect(grade);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        grade === selectedGrade ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Day Navigation */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-1 w-full">
              {days.map((day, index) => {
                const stats = getDayStats(index);
                const isSelected = index === mobileViewDay;
                
                return (
                  <button
                    key={index}
                    onClick={() => setMobileViewDay(index)}
                    className={`relative flex-1 px-2 py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{day.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {stats.filledSlots}/{stats.totalSlots}
                      </div>
                    </div>
                    {stats.hasConflicts && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Day Header */}
          <div className="px-4 py-3 bg-white">
            <h2 className="text-lg font-bold text-gray-900 tracking-wider uppercase">
              {days[mobileViewDay].name}
            </h2>
            <p className="text-sm text-gray-500">
              {(() => {
                const stats = getDayStats(mobileViewDay);
                return `${stats.filledSlots} of ${stats.totalSlots} periods scheduled`;
              })()}
            </p>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3">
          <div className="space-y-3">
            {timeSlots.map((slot, index) => {
              const cellKey = getCellKey(selectedGrade, slot.id, mobileViewDay);
              const isEditing = editingCell === cellKey;
              const cellData = subjects[cellKey];
              const hasConflict = conflicts[cellKey];
              const teacher = cellData?.teacher ? teachers[cellData.teacher] : null;
              const breakInfo = cellData ? getBreakInfo(cellData.subject) : null;
              const isBreak = cellData?.isBreak || breakInfo;

              return (
                <div key={slot.id} className="relative">
                  {/* Timeline Item */}
                  <div className="flex items-start gap-4">
                    {/* Time Badge */}
                    <div 
                      className="flex-shrink-0 cursor-pointer"
                      onClick={() => onTimeSlotClick(slot.id)}
                    >
                      {editingTimeSlot === slot.id ? (
                        <div className="bg-gray-900 rounded-xl px-3 py-2 space-y-1">
                          <input
                            type="text"
                            value={timeSlotEditValue}
                            onChange={(e) => onTimeSlotEditChange(e.target.value)}
                            onKeyDown={onTimeSlotKeyPress}
                            className="w-20 px-1 py-0.5 text-xs bg-white rounded border-0 focus:outline-none text-gray-900"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTimeSlotSave(slot.id);
                              }}
                              className="p-0.5 bg-green-500 text-white rounded text-xs"
                            >
                              <Save className="w-2 h-2" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelTimeSlotEdit();
                              }}
                              className="p-0.5 bg-red-500 text-white rounded text-xs"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-900 text-white rounded-xl px-3 py-2 min-w-[80px] text-center shadow-sm hover:bg-gray-800 transition-colors">
                          <div className="text-xs font-medium leading-tight">
                            {slot.time.split(' – ')[0]}
                          </div>
                          <div className="text-xs opacity-75 leading-tight">
                            {slot.time.split(' – ')[1]}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subject Card */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={onKeyPress}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="Enter subject name..."
                            autoFocus
                          />
                          <select
                            value={selectedTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                          >
                            <option value="">Select teacher...</option>
                            {Object.entries(teachers).map(([name, teacher]) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={onInputSubmit}
                              className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={onCancelEdit}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all relative group"
                          onClick={() => onCellClick(slot.id, mobileViewDay)}
                        >
                          {cellData ? (
                            <>
                              {/* Triangle Indicator */}
                              <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] ${
                                isBreak ? 'border-r-orange-500' : 'border-r-gray-900'
                              } border-b-[6px] border-b-transparent`}></div>
                              
                              {isBreak ? (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{breakInfo?.icon || '☕'}</span>
                                    <h3 className="font-semibold text-gray-900">{cellData.subject}</h3>
                                  </div>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {breakInfo?.type || 'Break'} Time
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">{cellData.subject}</h3>
                                  <p className="text-sm text-gray-500">
                                    {cellData.teacher ? `Teacher: ${cellData.teacher}` : 'No teacher assigned'}
                                  </p>
                                  {teacher && (
                                    <div className={`inline-block mt-2 px-2 py-1 rounded-full text-xs text-white ${teacher.color}`}>
                                      {teacher.subjects.slice(0, 2).join(', ')}
                                      {teacher.subjects.length > 2 && '...'}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {hasConflict && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm font-medium text-gray-500">Add Subject</p>
                              <p className="text-xs text-gray-400">Tap to schedule a lesson</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connect to next item with line (except last item) */}
                  {index < timeSlots.length - 1 && (
                    <div className="ml-10 w-px h-4 bg-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onStartAddTimeSlot}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Time Slot
          </button>
        </div>
      </div>
    );
  }

  // Desktop Layout - Keep existing design
  return (
    <div className="bg-white shadow-xl overflow-hidden border border-gray-200">
      {/* Desktop: Horizontal scroll container for smaller screens */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-6 gap-0">
            <div className="bg-primary p-2 md:p-4 flex items-center justify-center">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            
            {days.map((day, index) => (
              <div
                key={index}
                className={`${day.color} text-white p-2 md:p-4 text-center font-semibold text-sm md:text-lg transform -skew-x-12`}
              >
                <div className="transform skew-x-12">
                  <span className="hidden md:inline">{day.name}</span>
                  <span className="md:hidden">{day.name.slice(0, 3)}</span>
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
                className={`p-2 md:p-4 border-l-4 ${slot.color} flex items-center cursor-pointer hover:bg-gray-100 transition-colors relative group ${
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
                      className="flex-1 border-2 border-primary px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-gray-800"
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
                      <Save className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelTimeSlotEdit();
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-xs md:text-sm font-medium text-gray-700 flex-1">
                      {slot.time}
                    </div>
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Edit3 className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
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
                    className={`border-r border-gray-200 last:border-r-0 min-h-[80px] md:min-h-[100px] relative group ${
                      hasConflict ? 'bg-red-50 border-red-200' : ''
                    } ${isBreak ? 'bg-gradient-to-br from-gray-50 to-gray-100' : ''}`}
                  >
                    {isEditing ? (
                      <div className="p-2 md:p-3 h-full">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => onInputChange(e.target.value)}
                          onKeyDown={onKeyPress}
                          className="w-full border-2 border-primary px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2 bg-white text-gray-800"
                          placeholder="Subject name or break..."
                          autoFocus
                        />
                        <select
                          value={selectedTeacher}
                          onChange={(e) => onTeacherChange(e.target.value)}
                          className="w-full border-2 border-primary px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-gray-800"
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
                            className="text-xs bg-primary text-white px-2 py-1 hover:bg-primary-dark"
                          >
                            Save
                          </button>
                          <button
                            onClick={onCancelEdit}
                            className="text-xs bg-gray-500 text-white px-2 py-1 hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="p-2 md:p-3 h-full cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex flex-col justify-center relative"
                        onClick={() => onCellClick(slot.id, dayIndex)}
                      >
                        {cellData ? (
                          <div className="text-center">
                            {isBreak ? (
                              <div className="flex flex-col items-center">
                                <div className={`text-base md:text-lg mb-1 ${breakInfo?.color.replace('bg-', 'text-')}`}>
                                  {breakInfo?.icon || '☕'}
                                </div>
                                <div className="text-xs md:text-sm font-medium text-gray-700 mb-1">
                                  {cellData.subject}
                                </div>
                                <div className={`text-xs px-2 py-1 ${breakInfo?.color} text-white border`}>
                                  {breakInfo?.type || 'Break'}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-xs md:text-sm font-medium text-gray-800 mb-1">
                                  {cellData.subject}
                                </div>
                                {teacher && (
                                  <div className={`text-xs px-2 py-1 ${teacher.color} border`}>
                                    {cellData.teacher}
                                  </div>
                                )}
                              </>
                            )}
                            {hasConflict && (
                              <div className="absolute top-1 right-1">
                                <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-xs md:text-sm">
                            <div className="hidden md:block">Click to add class</div>
                            <div className="md:hidden">Tap to add</div>
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
                                  className={`p-1 text-xs ${breakItem.color} text-white hover:opacity-80 transition-opacity border`}
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
                                  className="p-1 text-xs bg-gray-500 text-white hover:bg-gray-600 transition-colors border"
                                  title="More options"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Edit3 className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
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
            <div className="p-2 md:p-4 border-l-4 border-l-primary/50 flex items-center relative group">
              <div 
                className="flex items-center justify-center w-full cursor-pointer hover:bg-primary/10 transition-all duration-200 p-2 md:p-4 border-2 border-dashed border-primary/30 hover:border-primary/50 group"
                onClick={onStartAddTimeSlot}
              >
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  <div className="p-2 md:p-3 bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/20">
                    <Plus className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
                      Add Time Slot
                    </div>
                    <div className="text-xs text-gray-500 mt-1 hidden md:block">
                      Click to add new period
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="border-r border-gray-200 last:border-r-0 min-h-[60px] md:min-h-[80px] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative group"
              >
                <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="text-xs text-gray-400">New slot</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 