import React from 'react';
import { Users, ChevronDown, User, XCircle, CheckCircle, Clock, Coffee, Save, Download, Upload } from 'lucide-react';

interface TimetableControlsProps {
  selectedGrade: string;
  grades: string[];
  showGradeDropdown: boolean;
  totalConflicts: number;
  onGradeSelect: (grade: string) => void;
  onGradeDropdownToggle: () => void;
  onManageTeachers: () => void;
  onManageTimeSlots: () => void;
  onManageBreaks: () => void;
  onToggleConflicts: () => void;
  onSaveTimetable: () => void;
  onLoadTimetable: () => void;
  onLoadMockData: () => void;
  showConflicts: boolean;
  getGradeProgress: (grade: string) => number;
}

export const TimetableControls: React.FC<TimetableControlsProps> = ({
  selectedGrade,
  grades,
  showGradeDropdown,
  totalConflicts,
  onGradeSelect,
  onGradeDropdownToggle,
  onManageTeachers,
  onManageTimeSlots,
  onManageBreaks,
  onToggleConflicts,
  onSaveTimetable,
  onLoadTimetable,
  onLoadMockData,
  showConflicts,
  getGradeProgress
}) => {
  return (
    <div className="bg-white shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Grade Selector */}
        <div className="relative">
          <button
            onClick={onGradeDropdownToggle}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-dark transition-colors border border-primary"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">{selectedGrade}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showGradeDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl z-50 min-w-[200px] max-h-60 overflow-y-auto">
              {grades.map((grade) => (
                <div
                  key={grade}
                  onClick={() => onGradeSelect(grade)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                    selectedGrade === grade ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span>{grade}</span>
                  <span className="text-sm text-gray-500">
                    {getGradeProgress(grade)}% complete
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onLoadMockData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white border border-gray-600 hover:bg-gray-700 hover:border-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Load Mock Data
          </button>
          <button
            onClick={onSaveTimetable}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary hover:bg-primary-dark hover:border-primary-dark transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Timetable
          </button>
          <button
            onClick={onLoadTimetable}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white border border-gray-600 hover:bg-gray-700 hover:border-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Load Timetable
          </button>
          <button
            onClick={onManageBreaks}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors text-gray-700"
          >
            <Coffee className="w-4 h-4" />
            Manage Breaks
          </button>
          <button
            onClick={onManageTimeSlots}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors text-gray-700"
          >
            <Clock className="w-4 h-4" />
            Manage Time Slots
          </button>
          <button
            onClick={onManageTeachers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors text-gray-700"
          >
            <User className="w-4 h-4" />
            Manage Teachers
          </button>
          <button
            onClick={onToggleConflicts}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
              totalConflicts > 0 
                ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
            }`}
          >
            {totalConflicts > 0 ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {totalConflicts > 0 ? `${totalConflicts} Conflicts` : 'No Conflicts'}
          </button>
        </div>
      </div>
    </div>
  );
}; 