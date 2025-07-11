'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TimetableHeader,
  TimetableControls,
  ConflictsPanel,
  TimetableGrid,
  LessonSummaryPanel,
  TeacherManagementModal,
  TimeSlotManager,
  BreakManager,
  TimeSlotModal
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
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ]);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showTimeSlotAddModal, setShowTimeSlotAddModal] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, Conflict>>({});
  const [showConflicts, setShowConflicts] = useState(false);
  const [isSummaryPanelMinimized, setIsSummaryPanelMinimized] = useState(false);

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
  
  // Debug: Log what we're doing
  console.log('Selected grade:', selectedGrade);
  console.log('Total subjects in mergedSubjects:', Object.keys(mergedSubjects).length);
  console.log('Breaks in mergedSubjects:', Object.entries(mergedSubjects).filter(([key, data]) => data?.isBreak).length);



  const days = [
    { name: 'Mon', color: 'bg-primary' },
    { name: 'Tues', color: 'bg-emerald-600' },
    { name: 'Wed', color: 'bg-amber-500' },
    { name: 'Thurs', color: 'bg-sky-500' },
    { name: 'Fri', color: 'bg-orange-500' }
  ];

  const getCellKey = (grade: string, timeId: number, dayIndex: number): string => `${grade}-${dayIndex + 1}-${timeId - 1}`;

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <TimetableHeader totalConflicts={getTotalConflicts()} />

        {/* Success Notification */}
        {showTimeSlotSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800">Time slot added successfully!</div>
                <div className="text-xs text-green-600">The new time period is now available for scheduling</div>
              </div>
            </div>
          </div>
        )}

        <TimetableControls
          selectedGrade={selectedGrade}
          grades={grades}
          showGradeDropdown={showGradeDropdown}
          totalConflicts={getTotalConflicts()}
          onGradeSelect={(grade) => {
            updateMainTimetable({ selectedGrade: grade });
            setShowGradeDropdown(false);
          }}
          onGradeDropdownToggle={() => setShowGradeDropdown(!showGradeDropdown)}
          onManageTeachers={() => setShowTeacherModal(true)}
          onManageTimeSlots={() => setShowTimeSlotModal(true)}
          onManageBreaks={() => setShowBreakModal(true)}
          onToggleConflicts={() => setShowConflicts(!showConflicts)}
          onSaveTimetable={handleSaveTimetable}
          onLoadTimetable={handleLoadTimetable}
          onLoadMockData={loadMockData}
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
        <div className="flex gap-6 relative">
          <div className="flex-1">
                    {/* Floating toggle button when summary panel is minimized */}
        {isSummaryPanelMinimized && (
          <div className="absolute top-6 right-6 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSummaryPanelMinimized(false)}
              className="border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200"
              title="Expand summary panel"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
              {/* Debug: Check lunch breaks */}
              {(() => {
                const lunchBreaksInSlot7 = Object.entries(mergedSubjects).filter(([key, data]) => {
                  const [grade, dayIndex, timeId] = key.split('-');
                  return data?.isBreak && data?.subject === 'Lunch' && timeId === '7';
                });
                console.log('Lunch breaks in slot 7 in mergedSubjects:', lunchBreaksInSlot7.length);
                if (lunchBreaksInSlot7.length > 0) {
                  console.log('Lunch breaks details:', lunchBreaksInSlot7);
                }
                
                // Also check all breaks in mergedSubjects
                const allBreaks = Object.entries(mergedSubjects).filter(([key, data]) => data?.isBreak);
                console.log('All breaks in mergedSubjects:', allBreaks.length);
                
                // Check what's in the original mainTimetable.subjects
                const originalLunchBreaks = Object.entries(mainTimetable.subjects).filter(([key, data]) => {
                  const [grade, dayIndex, timeId] = key.split('-');
                  return data?.isBreak && data?.subject === 'Lunch' && timeId === '7';
                });
                console.log('Original lunch breaks in mainTimetable:', originalLunchBreaks.length);
                
                // Let's see what breaks are actually in the data
                const allBreaksInData = Object.entries(mainTimetable.subjects).filter(([key, data]) => data?.isBreak);
                console.log('All breaks in mainTimetable:', allBreaksInData.length);
                
                // Show some examples of breaks
                const sampleBreaks = allBreaksInData.slice(0, 5);
                console.log('Sample breaks:', sampleBreaks.map(([key, data]) => ({ key, subject: data.subject, isBreak: data.isBreak })));
                
                // Check specifically for time slot 7 entries
                const timeSlot7Entries = Object.entries(mainTimetable.subjects).filter(([key, data]) => {
                  const [grade, dayIndex, timeId] = key.split('-');
                  return timeId === '7';
                });
                console.log('All time slot 7 entries:', timeSlot7Entries.map(([key, data]) => ({ key, subject: data.subject, isBreak: data.isBreak })));
                
                // Let's see what time slots are actually in the data
                const allTimeSlots = Object.entries(mainTimetable.subjects).map(([key, data]) => {
                  const [grade, dayIndex, timeId] = key.split('-');
                  return { key, timeId, dayIndex, subject: data.subject, isBreak: data.isBreak };
                });
                
                // Get unique time slot IDs
                const uniqueTimeSlots = [...new Set(allTimeSlots.map(item => item.timeId))].sort((a, b) => parseInt(a) - parseInt(b));
                console.log('Unique time slot IDs in data:', uniqueTimeSlots);
                
                // Check what's in each time slot
                uniqueTimeSlots.forEach(timeId => {
                  const entriesInSlot = allTimeSlots.filter(item => item.timeId === timeId);
                  const breaksInSlot = entriesInSlot.filter(item => item.isBreak);
                  console.log(`Time slot ${timeId}: ${entriesInSlot.length} entries, ${breaksInSlot.length} breaks`);
                  if (breaksInSlot.length > 0) {
                    console.log(`  Breaks in slot ${timeId}:`, breaksInSlot.map(item => ({ key: item.key, subject: item.subject })));
                  }
                });
                
                // Debug: Show what cell keys are being generated for the current grade
                console.log('Debug: Cell keys being generated for', selectedGrade);
                for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                  for (let timeId = 1; timeId <= 10; timeId++) {
                    const cellKey = getCellKey(selectedGrade, timeId, dayIndex);
                    const cellData = mergedSubjects[cellKey];
                    if (cellData) {
                      console.log(`  ${cellKey}: ${cellData.subject} (${cellData.isBreak ? 'break' : 'lesson'})`);
                    }
                  }
                }
                
                // Debug: Show what's actually in mergedSubjects for the current grade
                console.log('Debug: All data for', selectedGrade, 'in mergedSubjects:');
                Object.entries(mergedSubjects)
                  .filter(([key, data]) => key.startsWith(selectedGrade))
                  .forEach(([key, data]) => {
                    console.log(`  ${key}: ${data.subject} (${data.isBreak ? 'break' : 'lesson'})`);
                  });
                
                return null;
              })()}
              
              <TimetableGrid
              selectedGrade={selectedGrade}
              subjects={mergedSubjects}
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
              isAddingTimeSlot={false}
              newTimeSlotValue=""
              showTimeSlotSuccess={showTimeSlotSuccess}
              newTimeSlotData={newTimeSlotData}
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
              onStartAddTimeSlot={handleStartAddTimeSlot}
              onAddTimeSlot={handleAddTimeSlot}
              onNewTimeSlotChange={() => {}}
              onNewTimeSlotKeyPress={() => {}}
              onCancelAddTimeSlot={handleCancelAddTimeSlot}
              onNewTimeSlotDataChange={handleNewTimeSlotDataChange}
              getCellKey={getCellKey}
            />
          </div>

          {isSummaryPanelMinimized ? (
            // Minimized view - only toggle button
            <div className="w-16 flex flex-col items-center space-y-4 p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSummaryPanelMinimized(false)}
                className="border-primary/30 hover:bg-primary/5"
                title="Expand summary panel"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Full view
            <div className="w-80 space-y-6 relative">
              {/* Toggle button for minimize/expand */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSummaryPanelMinimized(true)}
                  className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
                  title="Minimize summary panel"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <LessonSummaryPanel stats={stats} />
            </div>
          )}
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

        <TimeSlotModal
          isOpen={showTimeSlotAddModal}
          onClose={() => setShowTimeSlotAddModal(false)}
          onAdd={handleAddTimeSlot}
          timeSlotData={newTimeSlotData}
          onTimeSlotDataChange={handleNewTimeSlotDataChange}
        />

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>Click any cell to assign a subject and teacher. Click time slots to edit them directly.</p>
          <p>Type break names (like "Lunch", "Recess") to add break periods with special styling.</p>
          <p>Red cells indicate teacher conflicts. Use the conflict panel to resolve scheduling issues.</p>
          <p>Hover over time slots to see the edit icon, or use the management buttons for advanced options.</p>
          <p>Click "Add New Time Slot" to open a modal with an intuitive time picker for start/end times.</p>
        </div>
      </div>
    </div>
  );
};

export default SmartTimetable;