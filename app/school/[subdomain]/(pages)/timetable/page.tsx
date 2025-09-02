'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Clock, BarChart3, AlertTriangle, Users, Coffee, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  ConflictsPanel,
  LessonSummaryPanel,
  TeacherManagementModal,
  TimeSlotManager,
  BreakManager,
  TimeSlotModal,
  TimetableFilter
} from './components';
import { useTimetableStore, type Teacher, type CellData, type TimeSlot, type Break } from '@/lib/stores/useTimetableStore';

// Type definitions
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
  // Use shared store
  const { 
    mainTimetable, 
    updateMainTimetable,
    loadMockData
  } = useTimetableStore();

  // Local state
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [timeSlotEditValue, setTimeSlotEditValue] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [showTimeSlotSuccess, setShowTimeSlotSuccess] = useState(false);
  const [newTimeSlotData, setNewTimeSlotData] = useState({
    startHour: '9',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '10',
    endMinute: '00',
    endPeriod: 'AM'
  });
  const [grades] = useState([
    'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ]);

  const days = [
    { name: 'MON', color: 'bg-primary' },
    { name: 'TUE', color: 'bg-primary/80' },
    { name: 'WED', color: 'bg-primary/70' },
    { name: 'THU', color: 'bg-primary/60' },
    { name: 'FRI', color: 'bg-primary/50' }
  ];

  // Function to transform grade names for display
  const getDisplayGradeName = (gradeName: string): string => {
    if (gradeName.startsWith('Grade')) {
      const gradeNum = parseInt(gradeName.split(' ')[1]);
      if (gradeNum >= 7 && gradeNum <= 12) {
        return `F${gradeNum - 6}`;
      }
    }
    return gradeName;
  };

  // Use display names in UI but keep internal grade names for logic
  const displayGrades = grades.map(grade => ({
    internal: grade,
    display: getDisplayGradeName(grade)
  }));

  const getCellKey = (grade: string, timeId: number, dayIndex: number): string => {
    // If we're passed a display name, convert it back to internal name
    const internalGrade = displayGrades.find(g => g.display === grade)?.internal || grade;
    return `${internalGrade}-${dayIndex + 1}-${timeId - 1}`;
  };

  const getGradeProgress = (grade: string): number => {
    let totalCells = timeSlots.length * days.length;
    let filledCells = 0;
    
    timeSlots.forEach(slot => {
      days.forEach((day, dayIndex) => {
        const cellKey = getCellKey(grade, slot.id, dayIndex);
        if (mergedSubjects[cellKey]) {
          filledCells++;
        }
      });
    });
    
    return Math.round((filledCells / totalCells) * 100);
  };
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showTimeSlotAddModal, setShowTimeSlotAddModal] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, Conflict>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Extract data from store
  const { subjects, teachers, timeSlots, breaks, selectedGrade } = mainTimetable;

  // Create a merged subjects object that includes breaks from all grades
  const mergedSubjects = { ...subjects };
  
  // Add breaks from all grades to ensure they're always visible
  Object.entries(subjects).forEach(([cellKey, cellData]) => {
    if (cellData && cellData.isBreak) {
      // Extract the time and day from the cell key
      const [grade, dayIndex, timeId] = cellKey.split('-');
      
      // Create a cell key for the current grade with the same time and day
      const currentGradeCellKey = `${selectedGrade}-${dayIndex}-${timeId}`;
      
      // Always add the break for the current grade, regardless of whether it exists
      mergedSubjects[currentGradeCellKey] = cellData;
    }
  });

  // Filter subjects based on search term
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return mergedSubjects;
    
    const filtered: Record<string, CellData> = {};
    Object.entries(mergedSubjects).forEach(([cellKey, cellData]) => {
      if (cellData && (
        cellData.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cellData.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        filtered[cellKey] = cellData;
      }
    });
    return filtered;
  }, [mergedSubjects, searchTerm]);

  // Debug: Log what we're doing
  console.log('Selected grade:', selectedGrade);
  console.log('Total subjects in mergedSubjects:', Object.keys(mergedSubjects).length);
  console.log('Breaks in mergedSubjects:', Object.entries(mergedSubjects).filter(([key, data]) => data?.isBreak).length);

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
    Object.entries(mergedSubjects).forEach(([cellKey, cellData]) => {
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
    Object.entries(mergedSubjects).forEach(([cellKey, cellData]) => {
      if (cellData && cellData.subject && !isBreakInput(cellData.subject)) {
        const [grade, timeId, dayIndex] = cellKey.split('-');
        const currentTimeId = parseInt(timeId);
        const currentDayIndex = parseInt(dayIndex);
        
        // Check next time slot
        const nextCellKey = getCellKey(selectedGrade, currentTimeId + 1, currentDayIndex);
        const nextCellData = mergedSubjects[nextCellKey];
        
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
    Object.entries(mergedSubjects).forEach(([cellKey, cellData]) => {
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
  }, [mainTimetable.subjects]);

  const handleCellClick = (timeId: number, dayIndex: number) => {
    const cellKey = getCellKey(selectedGrade, timeId, dayIndex);
    setEditingCell(cellKey);
    const currentData = mergedSubjects[cellKey];
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
      updateMainTimetable({ timeSlots: updatedTimeSlots });
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

  const handleNewTimeSlotDataChange = (field: string, value: string) => {
    setNewTimeSlotData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewTimeSlotKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTimeSlot();
    } else if (e.key === 'Escape') {
      setShowTimeSlotAddModal(false);
    }
  };

  const handleStartAddTimeSlot = () => {
    setShowTimeSlotAddModal(true);
  };

  const handleAddTimeSlot = () => {
    const startTime = `${newTimeSlotData.startHour}:${newTimeSlotData.startMinute} ${newTimeSlotData.startPeriod}`;
    const endTime = `${newTimeSlotData.endHour}:${newTimeSlotData.endMinute} ${newTimeSlotData.endPeriod}`;
    const timeString = `${startTime} – ${endTime}`;
    
    const colors = [
      'border-l-primary',
      'border-l-emerald-600',
      'border-l-amber-500',
      'border-l-sky-500',
      'border-l-orange-500',
      'border-l-green-600'
    ];
    
    const newTimeSlot: TimeSlot = {
      id: Math.max(...timeSlots.map(slot => slot.id), 0) + 1,
      time: timeString,
      color: colors[timeSlots.length % colors.length]
    };
    
    updateMainTimetable({ timeSlots: [...timeSlots, newTimeSlot] });
    setShowTimeSlotAddModal(false);
    
    // Reset time slot data to default values
    setNewTimeSlotData({
      startHour: '9',
      startMinute: '00',
      startPeriod: 'AM',
      endHour: '10',
      endMinute: '00',
      endPeriod: 'AM'
    });
    
    // Show success feedback
    setShowTimeSlotSuccess(true);
    setTimeout(() => setShowTimeSlotSuccess(false), 3000);
    
    // Scroll to the new time slot
    setTimeout(() => {
      const newSlotElement = document.querySelector(`[data-time-slot-id="${newTimeSlot.id}"]`);
      if (newSlotElement) {
        newSlotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCancelAddTimeSlot = () => {
    setShowTimeSlotAddModal(false);
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

      console.log('Adding lesson to main timetable:', {
        cellKey: editingCell,
        cellData: newCellData
      });

      // Update the subjects object properly
      const updatedSubjects = {
        ...mergedSubjects,
        [editingCell]: newCellData
      };

      updateMainTimetable({ subjects: updatedSubjects });
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

      // Update the subjects object properly
      const updatedSubjects = {
        ...mergedSubjects,
        [cellKey]: newCellData
      };

      updateMainTimetable({ subjects: updatedSubjects });
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
      
      updateMainTimetable({
        teachers: {
          ...teachers,
          [name]: {
            id: Object.keys(teachers).length + 1,
            subjects: teacherSubjects,
            color: colors[Object.keys(teachers).length % colors.length]
          }
        }
      });
    }
  };

  const getTeacherConflictCount = (teacher: string): number => {
    return Object.values(conflicts).filter(conflict => conflict.teacher === teacher).length;
  };

  const getTotalConflicts = (): number => {
    return Object.keys(conflicts).length;
  };

  const clearCell = (cellKey: string) => {
    const newSubjects = { ...mergedSubjects };
    delete newSubjects[cellKey];
    updateMainTimetable({ subjects: newSubjects });
  };

  const handleUpdateTimeSlots = (newTimeSlots: TimeSlot[]) => {
    updateMainTimetable({ timeSlots: newTimeSlots });
    // Clear any subjects that reference removed time slots
    const newSubjects = { ...mergedSubjects };
    Object.keys(newSubjects).forEach(cellKey => {
      const [grade, timeId, dayIndex] = cellKey.split('-');
      const timeSlotExists = newTimeSlots.some(slot => slot.id === parseInt(timeId));
      if (!timeSlotExists) {
        delete newSubjects[cellKey];
      }
    });
    updateMainTimetable({ subjects: newSubjects });
  };

  const handleUpdateBreaks = (newBreaks: Break[]) => {
    updateMainTimetable({ breaks: newBreaks });
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
    Object.entries(mergedSubjects).forEach(([cellKey, cellData]) => {
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
              updateMainTimetable({ subjects: newSubjects });
              
              // Optionally load other data if available
              if (data.metadata.timeSlots) {
                updateMainTimetable({ timeSlots: data.metadata.timeSlots });
              }
              if (data.metadata.breaks) {
                updateMainTimetable({ breaks: data.metadata.breaks });
              }
              if (data.metadata.teachers) {
                updateMainTimetable({ teachers: data.metadata.teachers });
              }
              if (data.metadata.grade) {
                updateMainTimetable({ selectedGrade: data.metadata.grade });
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
    <DashboardLayout
      searchFilter={
        <TimetableFilter
          selectedGrade={selectedGrade}
          onGradeSelect={(grade) => updateMainTimetable({ selectedGrade: grade })}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          getDisplayGradeName={getDisplayGradeName}
        />
      }
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Timetable Management
              </h1>
              <p className="text-gray-600 font-medium">
                {selectedGrade} • Weekly Schedule
              </p>
                  </div>
                  </div>
                </div>
        {/* Controls Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
                  <Button
              variant="outline"
              onClick={() => setShowTeacherModal(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Teachers
                  </Button>
                  <Button
              variant="outline"
              onClick={() => setShowTimeSlotModal(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Clock className="w-4 h-4 mr-2" />
              Time Slots
                  </Button>
                      <Button
              variant="outline"
              onClick={() => setShowBreakModal(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Breaks
                      </Button>
          </div>
          <div className="flex items-center gap-3">
                      <Button
              variant="outline"
              onClick={loadMockData}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Load Mock Data
                      </Button>
                      <Button
              onClick={handleSaveTimetable}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Timetable
                      </Button>
                    </div>
                  </div>

        {/* Timetable Grid */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="p-4 text-left font-bold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span>Time</span>
                        </div>
                    </th>
                    {days.map((day) => (
                      <th key={day.name} className="p-4 text-center font-bold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200 last:border-r-0">
                        <div className="flex flex-col items-center gap-1">
                          <span>{day.name.charAt(0) + day.name.slice(1).toLowerCase()}</span>
                          <div className="w-8 h-0.5 bg-primary"></div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, periodIndex) => (
                    <tr key={timeSlot.id} className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
                      <td 
                        className="p-4 text-sm font-semibold text-gray-700 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleTimeSlotClick(timeSlot.id)}
                      >
                        {editingTimeSlot === timeSlot.id ? (
                          <input
                            type="text"
                            value={timeSlotEditValue}
                            onChange={(e) => setTimeSlotEditValue(e.target.value)}
                            onKeyPress={handleTimeSlotKeyPress}
                            onBlur={() => handleTimeSlotSave(timeSlot.id)}
                            className="w-full p-1 border border-primary rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary"></div>
                            <span>{timeSlot.time}</span>
                          </div>
                        )}
                      </td>
                      {days.map((day, dayIndex) => {
                        const cellKey = getCellKey(selectedGrade, timeSlot.id, dayIndex);
                        const cellData = mergedSubjects[cellKey];
                        const hasConflict = conflicts[cellKey];
                        const isEditing = editingCell === cellKey;
                        
                        return (
                          <td key={day.name} className="p-3 border-r border-gray-100 last:border-r-0">
                            {isEditing ? (
                    <div className="space-y-2">
                                <input
                                  type="text"
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  onKeyPress={handleKeyPress}
                                  placeholder="Subject..."
                                  className="w-full p-2 border border-primary rounded text-sm"
                                  autoFocus
                                />
                                {!isBreakInput(inputValue) && (
                                  <select
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select Teacher</option>
                                    {Object.keys(teachers).map(teacher => (
                                      <option key={teacher} value={teacher}>{teacher}</option>
                                    ))}
                                  </select>
                                )}
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleInputSubmit}
                                    className="flex-1 px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary-dark"
                                  >
                                    Save
                                  </button>
                                  <button
                        onClick={() => {
                                      setEditingCell(null);
                                      setInputValue('');
                                      setSelectedTeacher('');
                        }}
                                    className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                      >
                                    Cancel
                                  </button>
                    </div>
                  </div>
                            ) : cellData ? (
                              <div className={`p-4 border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                cellData.isBreak 
                                  ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 text-primary-dark shadow-sm'
                                  : hasConflict
                                  ? 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-white border-gray-200 hover:border-primary/40 hover:shadow-md'
                              }`}>
                                <div className="font-bold text-sm mb-3">
                                  {cellData.isBreak ? (
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {cellData.breakType === 'lunch' && '🍽️'}
                                        {cellData.breakType === 'recess' && '🏃'}
                                        {cellData.breakType === 'break' && '☕'}
                                      </span>
                                      <span className="text-gray-700">{cellData.subject}</span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-900">{cellData.subject}</span>
                                  )}
            </div>
                                {!cellData.isBreak && (
                                  <div className="space-y-2 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3 text-gray-500" />
                                      <span className="text-xs font-medium text-gray-600">
                                        {cellData.teacher}
                                      </span>
              </div>
            </div>
          )}
                                {hasConflict && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    <span className="text-xs font-medium text-red-600">Conflict</span>
              </div>
            )}
                      </div>
                            ) : (
                              <div 
                                className="p-4 text-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 bg-gray-50/50 cursor-pointer hover:border-primary/40 hover:bg-gray-100/50"
                                onClick={() => handleCellClick(timeSlot.id, dayIndex)}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-6 h-6 border-2 border-gray-300 border-dashed"></div>
                                  <span>Free Period</span>
                </div>
              </div>
            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          </CardContent>
        </Card>

        {/* Conflicts Panel */}
        {getTotalConflicts() > 0 && (
          <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Schedule Conflicts ({getTotalConflicts()})
              </CardTitle>
            </CardHeader>
            <CardContent>
                <ConflictsPanel
                  conflicts={conflicts}
                  timeSlots={timeSlots}
                  days={days}
                  onClearCell={clearCell}
                />
            </CardContent>
          </Card>
        )}

        {/* Statistics Panel */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Schedule Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
                    <LessonSummaryPanel stats={stats} />
          </CardContent>
        </Card>

        {/* Modals */}
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

        <TimeSlotModal
          isOpen={showTimeSlotAddModal}
          onClose={() => setShowTimeSlotAddModal(false)}
          onAdd={handleAddTimeSlot}
          timeSlotData={newTimeSlotData}
          onTimeSlotDataChange={handleNewTimeSlotDataChange}
        />
      </div>
    </DashboardLayout>
  );
};

export default SmartTimetable;