'use client'

import React, { useState, useEffect } from 'react';
import {
  TimetableHeader,
  TimetableControls,
  ConflictsPanel,
  TimetableGrid,
  LessonSummaryPanel,
  TeacherManagementModal,
  TimeSlotManager,
  BreakManager
} from './components';

// Type definitions
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

interface Conflict {
  teacher: string;
  conflictingClasses: Array<{
    grade: string;
    cellKey: string;
    subject: string;
  }>;
}

interface TeacherSchedule {
  [teacher: string]: {
    [scheduleKey: string]: Array<{
      grade: string;
      cellKey: string;
      subject: string;
    }>;
  };
}

interface LessonStats {
  totalLessons: number;
  totalTeachers: number;
  totalSubjects: number;
  doubleLessons: number;
  totalBreaks: number;
  mostBusyTeacher: string;
  mostBusyDay: string;
  mostBusyTime: string;
  averageLessonsPerDay: number;
  completionPercentage: number;
  teacherWorkload: Record<string, number>;
  subjectDistribution: Record<string, number>;
  dayDistribution: Record<string, number>;
  timeSlotUsage: Record<string, number>;
  breakDistribution: Record<string, number>;
}

const SmartTimetable = () => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [subjects, setSubjects] = useState<Record<string, CellData>>({});
  const [teachers, setTeachers] = useState<Record<string, Teacher>>({
    'John Smith': { id: 1, subjects: ['Mathematics', 'Physics'], color: 'bg-primary text-white' },
    'Mary Johnson': { id: 2, subjects: ['English', 'Literature'], color: 'bg-emerald-600 text-white' },
    'David Brown': { id: 3, subjects: ['Chemistry', 'Biology'], color: 'bg-amber-500 text-white' },
    'Sarah Wilson': { id: 4, subjects: ['History', 'Geography'], color: 'bg-sky-500 text-white' },
    'Michael Davis': { id: 5, subjects: ['Art', 'Music'], color: 'bg-orange-500 text-white' },
    'Lisa Anderson': { id: 6, subjects: ['Physical Education', 'Health'], color: 'bg-green-600 text-white' }
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, time: '8:00 AM – 8:30 AM', color: 'border-l-primary' },
    { id: 2, time: '8:30 AM – 9:30 AM', color: 'border-l-emerald-600' },
    { id: 3, time: '9:30 AM – 10:30 AM', color: 'border-l-amber-500' },
    { id: 4, time: '10:30 AM – 11:30 AM', color: 'border-l-sky-500' },
    { id: 5, time: '11:30 AM – 12:15 PM', color: 'border-l-orange-500' },
    { id: 6, time: '12:15 PM – 12:40 PM', color: 'border-l-green-600' },
    { id: 7, time: '12:40 PM – 1:25 PM', color: 'border-l-primary' },
    { id: 8, time: '1:25 PM – 2:10 PM', color: 'border-l-emerald-600' }
  ]);
  const [breaks, setBreaks] = useState<Break[]>([
    { id: 'lunch-1', name: 'Lunch', type: 'lunch', color: 'bg-orange-500', icon: '🍽️' },
    { id: 'recess-1', name: 'Morning Recess', type: 'recess', color: 'bg-green-500', icon: '🏃' },
    { id: 'break-1', name: 'Break', type: 'break', color: 'bg-blue-500', icon: '☕' }
  ]);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [timeSlotEditValue, setTimeSlotEditValue] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [grades, setGrades] = useState([
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ]);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, Conflict>>({});
  const [showConflicts, setShowConflicts] = useState(false);

  const days = [
    { name: 'Mon', color: 'bg-primary' },
    { name: 'Tues', color: 'bg-emerald-600' },
    { name: 'Wed', color: 'bg-amber-500' },
    { name: 'Thurs', color: 'bg-sky-500' },
    { name: 'Fri', color: 'bg-orange-500' },
    { name: 'Sat', color: 'bg-green-600' }
  ];

  const getCellKey = (grade: string, timeId: number, dayIndex: number): string => `${grade}-${timeId}-${dayIndex}`;

  // Check if input is a break
  const isBreakInput = (input: string): Break | null => {
    return breaks.find(breakItem => 
      breakItem.name.toLowerCase() === input.toLowerCase()
    ) || null;
  };

  // Calculate comprehensive lesson statistics
  const calculateLessonStats = (): LessonStats => {
    const teacherWorkload: Record<string, number> = {};
    const subjectDistribution: Record<string, number> = {};
    const dayDistribution: Record<string, number> = {};
    const timeSlotUsage: Record<string, number> = {};
    const breakDistribution: Record<string, number> = {};
    let totalLessons = 0;
    let doubleLessons = 0;
    let totalBreaks = 0;

    // Analyze each cell
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (cellData && cellData.subject) {
        const isBreak = isBreakInput(cellData.subject);
        
        if (isBreak) {
          totalBreaks++;
          breakDistribution[isBreak.name] = (breakDistribution[isBreak.name] || 0) + 1;
        } else {
          totalLessons++;
          
          // Teacher workload
          if (cellData.teacher) {
            teacherWorkload[cellData.teacher] = (teacherWorkload[cellData.teacher] || 0) + 1;
          }
          
          // Subject distribution
          subjectDistribution[cellData.subject] = (subjectDistribution[cellData.subject] || 0) + 1;
        }
        
        // Parse cell key to get day and time
        const [grade, timeId, dayIndex] = cellKey.split('-');
        const dayName = days[parseInt(dayIndex)]?.name || 'Unknown';
        const timeSlot = timeSlots.find(t => t.id === parseInt(timeId));
        
        // Day distribution
        dayDistribution[dayName] = (dayDistribution[dayName] || 0) + 1;
        
        // Time slot usage
        if (timeSlot) {
          timeSlotUsage[timeSlot.time] = (timeSlotUsage[timeSlot.time] || 0) + 1;
        }
      }
    });

    // Check for double lessons (same subject in consecutive time slots)
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (cellData && cellData.subject && !isBreakInput(cellData.subject)) {
        const [grade, timeId, dayIndex] = cellKey.split('-');
        const currentTimeId = parseInt(timeId);
        const currentDayIndex = parseInt(dayIndex);
        
        // Check next time slot
        const nextCellKey = getCellKey(selectedGrade, currentTimeId + 1, currentDayIndex);
        const nextCellData = subjects[nextCellKey];
        
        if (nextCellData && nextCellData.subject === cellData.subject && nextCellData.teacher === cellData.teacher) {
          doubleLessons++;
        }
      }
    });

    // Find most busy teacher
    const mostBusyTeacher = Object.entries(teacherWorkload).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    // Find most busy day
    const mostBusyDay = Object.entries(dayDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    // Find most busy time slot
    const mostBusyTime = Object.entries(timeSlotUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    // Calculate averages
    const totalDays = days.length;
    const averageLessonsPerDay = totalDays > 0 ? Math.round((totalLessons / totalDays) * 10) / 10 : 0;
    
    // Completion percentage (excluding breaks)
    const totalPossibleCells = timeSlots.length * days.length;
    const completionPercentage = totalPossibleCells > 0 ? Math.round(((totalLessons + totalBreaks) / totalPossibleCells) * 100) : 0;

    return {
      totalLessons,
      totalTeachers: Object.keys(teacherWorkload).length,
      totalSubjects: Object.keys(subjectDistribution).length,
      doubleLessons,
      totalBreaks,
      mostBusyTeacher,
      mostBusyDay,
      mostBusyTime,
      averageLessonsPerDay,
      completionPercentage,
      teacherWorkload,
      subjectDistribution,
      dayDistribution,
      timeSlotUsage,
      breakDistribution
    };
  };

  const stats = calculateLessonStats();

  // Check for teacher conflicts
  const checkTeacherConflicts = () => {
    const newConflicts: Record<string, Conflict> = {};
    const teacherSchedule: TeacherSchedule = {};

    // Build teacher schedule map
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (cellData && cellData.teacher && !isBreakInput(cellData.subject)) {
        const teacher = cellData.teacher;
        const [grade, timeId, dayIndex] = cellKey.split('-');
        const scheduleKey = `${timeId}-${dayIndex}`;
        
        if (!teacherSchedule[teacher]) {
          teacherSchedule[teacher] = {};
        }
        
        if (!teacherSchedule[teacher][scheduleKey]) {
          teacherSchedule[teacher][scheduleKey] = [];
        }
        
        teacherSchedule[teacher][scheduleKey].push({
          grade,
          cellKey,
          subject: cellData.subject
        });
      }
    });

    // Find conflicts
    Object.entries(teacherSchedule).forEach(([teacher, schedule]) => {
      Object.entries(schedule).forEach(([scheduleKey, classes]) => {
        if (classes.length > 1) {
          classes.forEach(classInfo => {
            newConflicts[classInfo.cellKey] = {
              teacher,
              conflictingClasses: classes.filter(c => c.cellKey !== classInfo.cellKey)
            };
          });
        }
      });
    });

    setConflicts(newConflicts);
    return Object.keys(newConflicts).length > 0;
  };

  useEffect(() => {
    checkTeacherConflicts();
  }, [subjects]);

  const handleCellClick = (timeId: number, dayIndex: number) => {
    const cellKey = getCellKey(selectedGrade, timeId, dayIndex);
    setEditingCell(cellKey);
    const currentData = subjects[cellKey];
    setInputValue(currentData?.subject || '');
    setSelectedTeacher(currentData?.teacher || '');
  };

  const handleTimeSlotClick = (timeId: number) => {
    const timeSlot = timeSlots.find(slot => slot.id === timeId);
    if (timeSlot) {
      setEditingTimeSlot(timeId);
      setTimeSlotEditValue(timeSlot.time);
    }
  };

  const handleTimeSlotSave = (timeId: number) => {
    if (timeSlotEditValue.trim()) {
      const updatedTimeSlots = timeSlots.map(slot =>
        slot.id === timeId ? { ...slot, time: timeSlotEditValue.trim() } : slot
      );
      setTimeSlots(updatedTimeSlots);
    }
    setEditingTimeSlot(null);
    setTimeSlotEditValue('');
  };

  const handleTimeSlotKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingTimeSlot) {
      handleTimeSlotSave(editingTimeSlot);
    } else if (e.key === 'Escape') {
      setEditingTimeSlot(null);
      setTimeSlotEditValue('');
    }
  };

  const handleInputSubmit = () => {
    if (editingCell && inputValue.trim()) {
      const breakInfo = isBreakInput(inputValue);
      const newCellData: CellData = {
        subject: inputValue.trim(),
        teacher: breakInfo ? '' : selectedTeacher,
        isBreak: !!breakInfo,
        breakType: breakInfo?.type
      };

      setSubjects(prev => ({
        ...prev,
        [editingCell]: newCellData
      }));
      setEditingCell(null);
      setInputValue('');
      setSelectedTeacher('');
    }
  };

  const handleAddBreak = (cellKey: string, breakName: string) => {
    const breakInfo = breaks.find(breakItem => breakItem.name === breakName);
    if (breakInfo) {
      const newCellData: CellData = {
        subject: breakName,
        teacher: '',
        isBreak: true,
        breakType: breakInfo.type
      };

      setSubjects(prev => ({
        ...prev,
        [cellKey]: newCellData
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setInputValue('');
      setSelectedTeacher('');
    }
  };

  const addNewTeacher = () => {
    const name = prompt('Enter teacher name:');
    const subjectsInput = prompt('Enter subjects (comma-separated):');
    
    if (name && subjectsInput) {
      const teacherSubjects = subjectsInput.split(',').map(s => s.trim());
      const colors = [
        'bg-primary text-white',
        'bg-emerald-600 text-white',
        'bg-amber-500 text-white',
        'bg-sky-500 text-white',
        'bg-orange-500 text-white',
        'bg-green-600 text-white'
      ];
      
      setTeachers(prev => ({
        ...prev,
        [name]: {
          id: Object.keys(prev).length + 1,
          subjects: teacherSubjects,
          color: colors[Object.keys(prev).length % colors.length]
        }
      }));
    }
  };

  const getTeacherConflictCount = (teacher: string): number => {
    return Object.values(conflicts).filter(conflict => conflict.teacher === teacher).length;
  };

  const getTotalConflicts = (): number => {
    return Object.keys(conflicts).length;
  };

  const getGradeProgress = (grade: string): number => {
    let totalCells = timeSlots.length * days.length;
    let filledCells = 0;
    
    timeSlots.forEach(slot => {
      days.forEach((day, dayIndex) => {
        const cellKey = getCellKey(grade, slot.id, dayIndex);
        if (subjects[cellKey]) {
          filledCells++;
        }
      });
    });
    
    return Math.round((filledCells / totalCells) * 100);
  };

  const clearCell = (cellKey: string) => {
    const newSubjects = { ...subjects };
    delete newSubjects[cellKey];
    setSubjects(newSubjects);
  };

  const handleUpdateTimeSlots = (newTimeSlots: TimeSlot[]) => {
    setTimeSlots(newTimeSlots);
    // Clear any subjects that reference removed time slots
    const newSubjects = { ...subjects };
    Object.keys(newSubjects).forEach(cellKey => {
      const [grade, timeId, dayIndex] = cellKey.split('-');
      const timeSlotExists = newTimeSlots.some(slot => slot.id === parseInt(timeId));
      if (!timeSlotExists) {
        delete newSubjects[cellKey];
      }
    });
    setSubjects(newSubjects);
  };

  const handleUpdateBreaks = (newBreaks: Break[]) => {
    setBreaks(newBreaks);
  };

  const handleSaveTimetable = () => {
    // Create the timetable data structure
    const timetableData = {
      timetable: {} as Record<string, { subject: string; teacher: string; isBreak?: boolean; breakType?: string }>,
      metadata: {
        grade: selectedGrade,
        timeSlots: timeSlots,
        breaks: breaks,
        teachers: teachers,
        lastSaved: new Date().toISOString()
      }
    };

    // Convert subjects to the required format
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (cellData) {
        timetableData.timetable[cellKey] = {
          subject: cellData.subject,
          teacher: cellData.teacher || '',
          isBreak: cellData.isBreak || false,
          breakType: cellData.breakType || undefined
        };
      }
    });

    // Create and download the JSON file
    const dataStr = JSON.stringify(timetableData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetable-${selectedGrade}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    alert(`Timetable for ${selectedGrade} saved successfully!`);
  };

  const handleLoadTimetable = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            if (data.timetable && data.metadata) {
              // Load the timetable data
              const newSubjects: Record<string, CellData> = {};
              
              Object.entries(data.timetable).forEach(([cellKey, cellData]: [string, any]) => {
                newSubjects[cellKey] = {
                  subject: cellData.subject,
                  teacher: cellData.teacher || '',
                  isBreak: cellData.isBreak || false,
                  breakType: cellData.breakType || undefined
                };
              });

              // Update state
              setSubjects(newSubjects);
              
              // Optionally load other data if available
              if (data.metadata.timeSlots) {
                setTimeSlots(data.metadata.timeSlots);
              }
              if (data.metadata.breaks) {
                setBreaks(data.metadata.breaks);
              }
              if (data.metadata.teachers) {
                setTeachers(data.metadata.teachers);
              }
              if (data.metadata.grade) {
                setSelectedGrade(data.metadata.grade);
              }

              alert(`Timetable loaded successfully!`);
            } else {
              alert('Invalid timetable file format.');
            }
          } catch (error) {
            alert('Error loading timetable file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <TimetableHeader totalConflicts={getTotalConflicts()} />

        <TimetableControls
          selectedGrade={selectedGrade}
          grades={grades}
          showGradeDropdown={showGradeDropdown}
          totalConflicts={getTotalConflicts()}
          onGradeSelect={(grade) => {
            setSelectedGrade(grade);
            setShowGradeDropdown(false);
          }}
          onGradeDropdownToggle={() => setShowGradeDropdown(!showGradeDropdown)}
          onManageTeachers={() => setShowTeacherModal(true)}
          onManageTimeSlots={() => setShowTimeSlotModal(true)}
          onManageBreaks={() => setShowBreakModal(true)}
          onToggleConflicts={() => setShowConflicts(!showConflicts)}
          onSaveTimetable={handleSaveTimetable}
          onLoadTimetable={handleLoadTimetable}
          showConflicts={showConflicts}
          getGradeProgress={getGradeProgress}
        />

        {showConflicts && (
          <ConflictsPanel
            conflicts={conflicts}
            timeSlots={timeSlots}
            days={days}
            onClearCell={clearCell}
          />
        )}

        {/* Main Content with Timetable and Summary */}
        <div className="flex gap-6">
          <div className="flex-1">
            <TimetableGrid
              selectedGrade={selectedGrade}
              subjects={subjects}
              teachers={teachers}
              breaks={breaks}
              conflicts={conflicts}
              days={days}
              timeSlots={timeSlots}
              editingCell={editingCell}
              editingTimeSlot={editingTimeSlot}
              inputValue={inputValue}
              selectedTeacher={selectedTeacher}
              timeSlotEditValue={timeSlotEditValue}
              onCellClick={handleCellClick}
              onTimeSlotClick={handleTimeSlotClick}
              onInputChange={setInputValue}
              onTimeSlotEditChange={setTimeSlotEditValue}
              onTeacherChange={setSelectedTeacher}
              onInputSubmit={handleInputSubmit}
              onTimeSlotSave={handleTimeSlotSave}
              onCancelEdit={() => {
                setEditingCell(null);
                setInputValue('');
                setSelectedTeacher('');
              }}
              onCancelTimeSlotEdit={() => {
                setEditingTimeSlot(null);
                setTimeSlotEditValue('');
              }}
              onKeyPress={handleKeyPress}
              onTimeSlotKeyPress={handleTimeSlotKeyPress}
              onAddBreak={handleAddBreak}
              getCellKey={getCellKey}
            />
          </div>

          <LessonSummaryPanel stats={stats} />
        </div>

        <TeacherManagementModal
          isOpen={showTeacherModal}
          teachers={teachers}
          onClose={() => setShowTeacherModal(false)}
          onAddTeacher={addNewTeacher}
          getTeacherConflictCount={getTeacherConflictCount}
        />

        <TimeSlotManager
          timeSlots={timeSlots}
          onUpdateTimeSlots={handleUpdateTimeSlots}
          isOpen={showTimeSlotModal}
          onClose={() => setShowTimeSlotModal(false)}
        />

        <BreakManager
          breaks={breaks}
          onUpdateBreaks={handleUpdateBreaks}
          isOpen={showBreakModal}
          onClose={() => setShowBreakModal(false)}
        />

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>Click any cell to assign a subject and teacher. Click time slots to edit them directly.</p>
          <p>Type break names (like "Lunch", "Recess") to add break periods with special styling.</p>
          <p>Red cells indicate teacher conflicts. Use the conflict panel to resolve scheduling issues.</p>
          <p>Hover over time slots to see the edit icon, or use the management buttons for advanced options.</p>
        </div>
      </div>
    </div>
  );
};

export default SmartTimetable;