'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle, Clock, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronUp, Menu, X, Settings, BarChart3, AlertTriangle, Users, Calendar, Coffee, Save, Upload, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  TimetableHeader,
  TimetableControls,
  ConflictsPanel,
  TimetableGrid,
  LessonSummaryPanel,
  TeacherManagementModal,
  TimeSlotManager,
  BreakManager,
  TimeSlotModal,
  TimetableFilter
} from './components';
import { useTimetableStore, type Teacher, type CellData, type TimeSlot, type Break } from '@/lib/stores/useTimetableStore';
import {
  useTimetableStats,
  useTimetableConflicts,
  useConflictCount,
  useMergedSubjects,
  useFilteredSubjects,
} from './hooks';

// Note: Types are now imported from hooks

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

  // Memoize constants
  const days = useMemo(() => [
    { name: 'MON', color: 'bg-primary' },
    { name: 'TUE', color: 'bg-primary/80' },
    { name: 'WED', color: 'bg-primary/70' },
    { name: 'THU', color: 'bg-primary/60' },
    { name: 'FRI', color: 'bg-primary/50' }
  ], []);

  // Memoize helper functions
  const getDisplayGradeName = useCallback((gradeName: string): string => {
    if (gradeName.startsWith('Grade')) {
      const gradeNum = parseInt(gradeName.split(' ')[1]);
      if (gradeNum >= 7 && gradeNum <= 12) {
        return `F${gradeNum - 6}`;
      }
    }
    return gradeName;
  }, []);

  // Memoize display grades
  const displayGrades = useMemo(() => 
    grades.map(grade => ({
      internal: grade,
      display: getDisplayGradeName(grade)
    })),
    [grades, getDisplayGradeName]
  );

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showTimeSlotAddModal, setShowTimeSlotAddModal] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [isSummaryPanelMinimized, setIsSummaryPanelMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  
  // Mobile-specific state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    controls: false,
    conflicts: false,
    stats: false
  });

  // Extract data from store
  const { subjects, teachers, timeSlots, breaks, selectedGrade } = mainTimetable;

  // Use optimized hooks for data merging and filtering
  const mergedSubjects = useMergedSubjects(subjects, selectedGrade);
  const filteredSubjects = useFilteredSubjects(mergedSubjects, searchTerm);

  const getCellKey = useCallback((grade: string, timeId: number, dayIndex: number): string => {
    const internalGrade = displayGrades.find(g => g.display === grade)?.internal || grade;
    return `${internalGrade}-${dayIndex + 1}-${timeId - 1}`;
  }, [displayGrades]);

  const getGradeProgress = useCallback((grade: string): number => {
    const totalCells = timeSlots.length * days.length;
    let filledCells = 0;
    
    timeSlots.forEach(slot => {
      days.forEach((_day, dayIndex) => {
        const cellKey = getCellKey(grade, slot.id, dayIndex);
        if (mergedSubjects[cellKey]) {
          filledCells++;
        }
      });
    });
    
    return Math.round((filledCells / totalCells) * 100);
  }, [timeSlots, days, getCellKey, mergedSubjects]);

  // Use optimized hooks for calculations
  const stats = useTimetableStats(mergedSubjects, breaks, timeSlots, days, selectedGrade);
  const conflicts = useTimetableConflicts(mergedSubjects, breaks);
  const totalConflicts = useConflictCount(conflicts);

  // Check if input is a break
  const isBreakInput = useCallback((input: string): Break | null => {
    return breaks.find(breakItem => 
      breakItem.name.toLowerCase() === input.toLowerCase()
    ) || null;
  }, [breaks]);

  const handleCellClick = useCallback((timeId: number, dayIndex: number) => {
    const cellKey = getCellKey(selectedGrade, timeId, dayIndex);
    setEditingCell(cellKey);
    const currentData = mergedSubjects[cellKey];
    setInputValue(currentData?.subject || '');
    setSelectedTeacher(currentData?.teacher || '');
  }, [getCellKey, selectedGrade, mergedSubjects]);

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

  const handleInputSubmit = useCallback(() => {
    if (editingCell && inputValue.trim()) {
      const breakInfo = isBreakInput(inputValue);
      const newCellData: CellData = {
        subject: inputValue.trim(),
        teacher: breakInfo ? '' : selectedTeacher,
        isBreak: !!breakInfo,
        breakType: breakInfo?.type
      };

      const updatedSubjects = {
        ...mergedSubjects,
        [editingCell]: newCellData
      };

      updateMainTimetable({ subjects: updatedSubjects });
      setEditingCell(null);
      setInputValue('');
      setSelectedTeacher('');
    }
  }, [editingCell, inputValue, isBreakInput, selectedTeacher, mergedSubjects, updateMainTimetable]);

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

  const getTeacherConflictCount = useCallback((teacher: string): number => {
    return Object.values(conflicts).filter(conflict => conflict.teacher === teacher).length;
  }, [conflicts]);

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

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Mobile-optimized container with no overflow */}
        <div className="w-full max-w-full overflow-hidden">
          {/* Mobile Header - Styled like student timetable */}
          <div className="sticky top-0 z-40 md:hidden">
            <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary flex items-center justify-center shadow-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Timetable</h1>
                    <p className="text-xs text-gray-600">Schedule Management</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200">
                    {selectedGrade}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                  >
                    {showMobileMenu ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
                  </Button>
                </div>
              </div>
              
              {/* Status Bar - Student timetable style */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-gray-600">{stats.completionPercentage}% Complete</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{stats.totalTeachers} Teachers</span>
                  </div>
                </div>
                {totalConflicts > 0 && (
                  <div className="flex items-center space-x-1.5 px-2 py-1 bg-red-50 border border-red-200">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">{totalConflicts} conflicts</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay - Student timetable style */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary flex items-center justify-center shadow-lg">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Tools</h2>
                      <p className="text-xs text-gray-600">Timetable Management</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
                
                <div className="p-4 space-y-1">
                  {/* Management Section */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">Management</h3>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-3 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                        onClick={() => {
                          setShowTeacherModal(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-gray-200">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">Teachers</p>
                          <p className="text-xs text-gray-500">Manage staff & subjects</p>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-3 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                        onClick={() => {
                          setShowTimeSlotModal(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-gray-200">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">Time Slots</p>
                          <p className="text-xs text-gray-500">Configure periods</p>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-3 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                        onClick={() => {
                          setShowBreakModal(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-gray-200">
                          <Coffee className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">Breaks</p>
                          <p className="text-xs text-gray-500">Manage break periods</p>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">Quick Actions</h3>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-3 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-transparent hover:border-red-200 hover:shadow-sm"
                        onClick={() => {
                          toggleSection('conflicts');
                          setShowMobileMenu(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-red-50 flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-red-100">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-red-700">Conflicts</p>
                          <p className="text-xs text-red-600">{totalConflicts} issues to resolve</p>
                        </div>
                        {totalConflicts > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                            {totalConflicts}
                          </div>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-3 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                        onClick={() => {
                          toggleSection('stats');
                          setShowMobileMenu(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-gray-200">
                          <BarChart3 className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">Statistics</p>
                          <p className="text-xs text-gray-500">View analytics</p>
                        </div>
                      </Button>
                    </div>
                  </div>
                  
                  {/* File Operations */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">File Operations</h3>
                    <div className="space-y-2">
                      <Button
                        className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl text-white font-semibold transition-all duration-200 border border-primary/20 hover:border-primary/30"
                        onClick={() => {
                          handleSaveTimetable();
                          setShowMobileMenu(false);
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Timetable
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          handleLoadTimetable();
                          setShowMobileMenu(false);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Load Timetable
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          loadMockData();
                          setShowMobileMenu(false);
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Load Sample Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Header - Student timetable style */}
          <div className="hidden md:block p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <TimetableHeader totalConflicts={totalConflicts} />
            </div>
          </div>

          {/* Success Notification */}
          {showTimeSlotSuccess && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 shadow-2xl flex items-center gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-800">Success!</div>
                  <div className="text-xs text-green-600">New time slot added to schedule</div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Controls - Student timetable style */}
          <div className="hidden md:block p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <TimetableControls
                selectedGrade={getDisplayGradeName(selectedGrade)}
                grades={displayGrades.map(g => g.display)}
                showGradeDropdown={showGradeDropdown}
                totalConflicts={totalConflicts}
                onGradeSelect={(displayGrade) => {
                  const internalGrade = displayGrades.find(g => g.display === displayGrade)?.internal || displayGrade;
                  updateMainTimetable({ selectedGrade: internalGrade });
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
                getGradeProgress={(displayGrade) => {
                  const internalGrade = displayGrades.find(g => g.display === displayGrade)?.internal || displayGrade;
                  return getGradeProgress(internalGrade);
                }}
              />
            </div>
          </div>

          {/* Mobile Collapsible Sections */}
          <div className="md:hidden">
            {/* Conflicts Section */}
            {(showConflicts || expandedSections.conflicts) && totalConflicts > 0 && (
              <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Conflicts</h3>
                      <div className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium border border-red-200">
                        {totalConflicts}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowConflicts(false);
                        toggleSection('conflicts');
                      }}
                      className="p-1.5 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                    >
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 bg-gray-50">
                    <ConflictsPanel
                      conflicts={conflicts}
                      timeSlots={timeSlots}
                      days={days}
                      onClearCell={clearCell}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Section */}
            {expandedSections.stats && (
              <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-100 flex items-center justify-center">
                        <BarChart3 className="h-3 w-3 text-gray-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Statistics</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('stats')}
                      className="p-1.5 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                    >
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 bg-gray-50">
                    <LessonSummaryPanel stats={stats} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Conflicts Panel */}
          {showConflicts && (
            <div className="hidden md:block p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <ConflictsPanel
                  conflicts={conflicts}
                  timeSlots={timeSlots}
                  days={days}
                  onClearCell={clearCell}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 relative">
                {/* Timetable Grid */}
                <div className="flex-1 min-w-0">
                  {/* Floating toggle button when summary panel is minimized (desktop only) */}
                  {isSummaryPanelMinimized && (
                    <div className="hidden lg:block absolute top-6 right-6 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSummaryPanelMinimized(false)}
                        className="border-gray-200 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:border-gray-300 shadow-sm transition-all duration-200"
                        title="Expand summary panel"
                      >
                        <PanelLeftOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <TimetableGrid
                    selectedGrade={selectedGrade}
                    subjects={searchTerm ? filteredSubjects : mergedSubjects}
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
                    onGradeSelect={(grade) => updateMainTimetable({ selectedGrade: grade })}
                    getCellKey={getCellKey}
                  />
                </div>

                {/* Desktop Summary Panel */}
                {isSummaryPanelMinimized ? (
                  <div className="hidden lg:flex w-16 flex-col items-center space-y-4 p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSummaryPanelMinimized(false)}
                      className="border-gray-300 hover:bg-gray-50"
                      title="Expand summary panel"
                    >
                      <PanelLeftOpen className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="hidden lg:block w-80 space-y-4 lg:space-y-6 relative">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSummaryPanelMinimized(true)}
                        className="border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200"
                        title="Minimize summary panel"
                      >
                        <PanelLeftClose className="h-4 w-4" />
                      </Button>
                    </div>
                    <LessonSummaryPanel stats={stats} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Instructions */}
          <div className="md:hidden px-4 py-6 bg-gray-50 border-t border-gray-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary flex items-center justify-center mx-auto shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Getting Started</h3>
                <p className="text-sm text-gray-600">
                  Tap any cell to add subjects and teachers
                </p>
              </div>
              <div className="flex justify-center space-x-6 pt-2">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-100 flex items-center justify-center mx-auto mb-1">
                    <Coffee className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-500">Add breaks</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-100 flex items-center justify-center mx-auto mb-1">
                    <Menu className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-500">Use menu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Instructions */}
          <div className="hidden md:block px-4 md:px-8 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center text-xs md:text-sm text-gray-600 space-y-2">
                <p>Click any cell to assign a subject and teacher. Click time slots to edit them directly.</p>
                <p>Type break names (like "Lunch", "Recess") to add break periods with special styling.</p>
                <p>Red cells indicate teacher conflicts. Use the conflict panel to resolve scheduling issues.</p>
                <p>Hover over time slots to see the edit icon, or use the management buttons for advanced options.</p>
                <p>Click "Add New Time Slot" to open a modal with an intuitive time picker for start/end times.</p>
              </div>
            </div>
          </div>
        </div>

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