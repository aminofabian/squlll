'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, CheckCircle2, BookOpen, Calendar, Users, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CreateEntryRequest } from '@/lib/types/timetable';

interface BulkLessonEntryDrawerProps {
  open: boolean;
  onClose: () => void;
  gradeId?: string;
  dayOfWeek?: number; // Optional: pre-select a day
}

interface LessonEntry {
  id: string; // Temporary ID for React keys
  timeSlotId: string;
  subjectId: string;
  teacherId: string;
  roomNumber: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function BulkLessonEntryDrawer({ 
  open, 
  onClose, 
  gradeId: initialGradeId,
  dayOfWeek: initialDayOfWeek 
}: BulkLessonEntryDrawerProps) {
  const { 
    subjects, 
    teachers, 
    timeSlots, 
    grades, 
    selectedGradeId,
    bulkCreateEntries,
    loadEntries 
  } = useTimetableStore();
  const { selectedTerm } = useSelectedTerm();
  const { getSubjectsByLevelId, getGradeById } = useSchoolConfigStore();
  const { toast } = useToast();
  
  const [selectedGradeIdState, setSelectedGradeIdState] = useState(initialGradeId || selectedGradeId || '');
  const [selectedDay, setSelectedDay] = useState<number>(initialDayOfWeek || 1);
  const [entries, setEntries] = useState<LessonEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Get termId
  const termId = selectedTerm?.id || '';

  // Get available subjects for selected grade
  const availableSubjects = useMemo(() => {
    if (!selectedGradeIdState) return [];
    const gradeInfo = getGradeById(selectedGradeIdState);
    if (!gradeInfo) return [];
    return getSubjectsByLevelId(gradeInfo.levelId);
  }, [selectedGradeIdState, getGradeById, getSubjectsByLevelId]);

  // Filter teachers who can teach the selected grade
  const availableTeachers = useMemo(() => {
    if (!selectedGradeIdState) return teachers;
    const grade = grades.find(g => g.id === selectedGradeIdState);
    if (!grade) return teachers;
    
    return teachers.filter(teacher => {
      const canTeachGrade = !grade.name || (teacher.gradeLevels && teacher.gradeLevels.includes(grade.name));
      return canTeachGrade;
    });
  }, [teachers, grades, selectedGradeIdState]);

  // Initialize with one empty entry when drawer opens
  useEffect(() => {
    if (open && entries.length === 0) {
      setEntries([{
        id: `entry-${Date.now()}`,
        timeSlotId: '',
        subjectId: '',
        teacherId: '',
        roomNumber: '',
      }]);
    }
  }, [open, entries.length]);

  // Reset when drawer closes
  useEffect(() => {
    if (!open) {
      setEntries([]);
      setSelectedGradeIdState(initialGradeId || selectedGradeId || '');
      setSelectedDay(initialDayOfWeek || 1);
    }
  }, [open, initialGradeId, selectedGradeId, initialDayOfWeek]);

  const addEntry = () => {
    setEntries([...entries, {
      id: `entry-${Date.now()}-${Math.random()}`,
      timeSlotId: '',
      subjectId: '',
      teacherId: '',
      roomNumber: '',
    }]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<LessonEntry>) => {
    setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleSave = async () => {
    if (!selectedGradeIdState) {
      toast({
        title: 'Error',
        description: 'Please select a grade first.',
        variant: 'destructive',
      });
      return;
    }

    if (!termId) {
      toast({
        title: 'Error',
        description: 'No term selected. Please select a term first.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all entries
    const invalidEntries = entries.filter(e => 
      !e.timeSlotId || !e.subjectId || !e.teacherId
    );

    if (invalidEntries.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please fill in all required fields (time slot, subject, teacher) for all ${invalidEntries.length} entry/entries.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds: string[] = [];
    
    entries.forEach((entry, index) => {
      if (!uuidRegex.test(entry.timeSlotId)) invalidIds.push(`Entry ${index + 1}: timeSlotId`);
      if (!uuidRegex.test(entry.subjectId)) invalidIds.push(`Entry ${index + 1}: subjectId`);
      if (!uuidRegex.test(entry.teacherId)) invalidIds.push(`Entry ${index + 1}: teacherId`);
    });

    if (invalidIds.length > 0) {
      toast({
        title: 'Invalid IDs',
        description: `Invalid ID format detected: ${invalidIds.join(', ')}. Please reload the page.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Convert to CreateEntryRequest format
      const entryRequests: CreateEntryRequest[] = entries.map(entry => ({
        gradeId: selectedGradeIdState,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        timeSlotId: entry.timeSlotId,
        dayOfWeek: selectedDay,
        roomNumber: entry.roomNumber?.trim() || undefined,
      }));

      console.log('Bulk creating entries:', {
        termId,
        gradeId: selectedGradeIdState,
        dayOfWeek: selectedDay,
        entryCount: entryRequests.length,
        entries: entryRequests,
      });

      // Use the store's bulkCreateEntries method
      await bulkCreateEntries(termId, selectedGradeIdState, entryRequests);

      // Reload entries to update the UI
      await loadEntries(termId, selectedGradeIdState);

      toast({
        title: 'Success',
        description: `Successfully created ${entryRequests.length} lesson${entryRequests.length !== 1 ? 's' : ''} for ${DAYS[selectedDay - 1]}.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating bulk entries:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lessons. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get time slots that aren't already used in entries
  // But always include the currently selected time slot for each entry
  const availableTimeSlots = useMemo(() => {
    const usedTimeSlotIds = new Set(entries.map(e => e.timeSlotId).filter(Boolean));
    const currentEntryTimeSlotIds = new Set(entries.map(e => e.timeSlotId).filter(Boolean));
    
    return timeSlots.filter(slot => {
      // Always include if it's selected in any entry (so SelectValue can display it)
      if (currentEntryTimeSlotIds.has(slot.id)) return true;
      // Otherwise, only include if it's not used
      return !usedTimeSlotIds.has(slot.id);
    });
  }, [timeSlots, entries]);

  // Get teachers already scheduled at selected time slots (for conflict warning)
  const getBusyTeachers = (timeSlotId: string) => {
    // This would require checking existing entries - simplified for now
    return [];
  };

  const selectedGrade = grades.find(g => g.id === selectedGradeIdState);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Bulk Create Lessons
          </SheetTitle>
          <SheetDescription className="text-base mt-2">
            Create multiple lessons at once for a specific day and grade. Fill in the details for each lesson below.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Configuration Section */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Schedule Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grade Selection */}
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Grade *
                  </Label>
                  <Select
                    value={selectedGradeIdState}
                    onValueChange={setSelectedGradeIdState}
                  >
                    <SelectTrigger id="grade" className="h-10">
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.displayName || grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Day Selection */}
                <div className="space-y-2">
                  <Label htmlFor="day" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Day of Week *
                  </Label>
                  <Select
                    value={selectedDay.toString()}
                    onValueChange={(value) => setSelectedDay(parseInt(value))}
                  >
                    <SelectTrigger id="day" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entries List */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Lessons to Create
                  {entries.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      {entries.length}
                    </span>
                  )}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                  className="gap-2 border-primary/20 hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4" />
                  Add Lesson
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No lessons added yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click "Add Lesson" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry, index) => {
                    const selectedTimeSlot = timeSlots.find(s => s.id === entry.timeSlotId);
                    const selectedSubject = availableSubjects.find(s => s.id === entry.subjectId);
                    const selectedTeacher = availableTeachers.find(t => t.id === entry.teacherId);
                    
                    return (
                      <Card
                        key={entry.id}
                        className="border-2 hover:border-primary/30 transition-colors bg-gradient-to-br from-background to-muted/20"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <CardTitle className="text-sm font-semibold">Lesson {index + 1}</CardTitle>
                                {selectedTimeSlot && selectedSubject && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {selectedTimeSlot.time} • {selectedSubject.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            {entries.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEntry(entry.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Time Slot */}
                            <div className="space-y-2">
                              <Label htmlFor={`timeSlot-${entry.id}`} className="text-xs font-medium">
                                Time Slot *
                              </Label>
                              <Select
                                value={entry.timeSlotId || undefined}
                                onValueChange={(value) => updateEntry(entry.id, { timeSlotId: value })}
                              >
                                <SelectTrigger id={`timeSlot-${entry.id}`} className="h-9">
                                  <SelectValue placeholder="Select time slot">
                                    {entry.timeSlotId && (() => {
                                      const selectedSlot = timeSlots.find(s => s.id === entry.timeSlotId);
                                      return selectedSlot ? `Period ${selectedSlot.periodNumber} - ${selectedSlot.time}` : 'Select time slot';
                                    })()}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTimeSlots.map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id}>
                                      Period {slot.periodNumber} - {slot.time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                              <Label htmlFor={`subject-${entry.id}`} className="text-xs font-medium">
                                Subject *
                              </Label>
                              <Select
                                value={entry.subjectId}
                                onValueChange={(value) => updateEntry(entry.id, { subjectId: value })}
                              >
                                <SelectTrigger id={`subject-${entry.id}`} className="h-9">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSubjects.map((subject) => {
                                    const subjectColor = 'color' in subject && typeof subject.color === 'string' ? subject.color : '#3B82F6';
                                    return (
                                      <SelectItem key={subject.id} value={subject.id}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: subjectColor }}
                                          />
                                          {subject.name}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Teacher */}
                            <div className="space-y-2">
                              <Label htmlFor={`teacher-${entry.id}`} className="text-xs font-medium">
                                Teacher *
                              </Label>
                              <Select
                                value={entry.teacherId}
                                onValueChange={(value) => updateEntry(entry.id, { teacherId: value })}
                              >
                                <SelectTrigger id={`teacher-${entry.id}`} className="h-9">
                                  <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTeachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Room Number */}
                            <div className="space-y-2">
                              <Label htmlFor={`room-${entry.id}`} className="text-xs font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                Room Number <span className="text-muted-foreground font-normal">(Optional)</span>
                              </Label>
                              <Input
                                id={`room-${entry.id}`}
                                value={entry.roomNumber}
                                onChange={(e) => updateEntry(entry.id, { roomNumber: e.target.value })}
                                placeholder="e.g. Room 4"
                                className="h-9"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {entries.length > 0 && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Ready to Create</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">{entries.length}</span> lesson{entries.length !== 1 ? 's' : ''} for{' '}
                        <span className="font-semibold text-foreground">{DAYS[selectedDay - 1]}</span>
                        {selectedGrade && (
                          <>
                            {' '}in{' '}
                            <span className="font-semibold text-foreground">
                              {selectedGrade.displayName || selectedGrade.name}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs">
                        All required fields must be filled before creating.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-6" />
        
        <SheetFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || entries.length === 0 || !selectedGradeIdState || !termId}
            className="min-w-[160px] bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create {entries.length} Lesson{entries.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

