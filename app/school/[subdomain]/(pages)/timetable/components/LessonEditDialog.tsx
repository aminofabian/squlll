'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import type { EnrichedTimetableEntry } from '@/lib/types/timetable';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
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

interface LessonEditDialogProps {
  lesson: (EnrichedTimetableEntry & { isNew?: boolean }) | null;
  onClose: () => void;
}

export function LessonEditDialog({ lesson, onClose }: LessonEditDialogProps) {
  const { subjects, teachers, entries, timeSlots, grades, updateEntry, addEntry, deleteEntry } = useTimetableStore();
  
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    roomNumber: '',
  });

  useEffect(() => {
    if (lesson && !lesson.isNew) {
      setFormData({
        subjectId: lesson.subjectId,
        teacherId: lesson.teacherId,
        roomNumber: lesson.roomNumber || '',
      });
    } else if (lesson && lesson.isNew) {
      // For new lessons, find first available teacher
      const busyTeacherIds = new Set(
        entries
          .filter((entry) => 
            entry.timeSlotId === lesson.timeSlotId && 
            entry.dayOfWeek === lesson.dayOfWeek
          )
          .map((entry) => entry.teacherId)
      );

      const firstSubject = subjects[0];
      const firstAvailableTeacher = teachers.find((teacher) => {
        const canTeachSubject = firstSubject && teacher.subjects.includes(firstSubject.name);
        const isAvailable = !busyTeacherIds.has(teacher.id);
        return canTeachSubject && isAvailable;
      });

      setFormData({
        subjectId: firstSubject?.id || '',
        teacherId: firstAvailableTeacher?.id || '',
        roomNumber: '',
      });
    }
  }, [lesson, subjects, teachers, entries]);

  const handleSave = () => {
    if (!lesson) return;

    if (lesson.isNew) {
      // Add new lesson
      addEntry({
        gradeId: lesson.gradeId,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        timeSlotId: lesson.timeSlotId,
        dayOfWeek: lesson.dayOfWeek,
        roomNumber: formData.roomNumber || undefined,
      });
    } else {
      // Update existing lesson
      updateEntry(lesson.id, {
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        roomNumber: formData.roomNumber || undefined,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (lesson && !lesson.isNew && confirm('Are you sure you want to delete this lesson?')) {
      deleteEntry(lesson.id);
      onClose();
    }
  };

  if (!lesson) return null;

  const isNew = lesson.isNew;
  const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
  const selectedTeacher = teachers.find((t) => t.id === formData.teacherId);
  
  // Get timeslot and grade information
  const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
  const grade = grades.find((g) => g.id === lesson.gradeId);

  // Find teachers already scheduled at this timeslot
  const busyTeacherIds = new Set(
    entries
      .filter((entry) => {
        // Same timeslot and day
        const sameSlot = entry.timeSlotId === lesson.timeSlotId && entry.dayOfWeek === lesson.dayOfWeek;
        // Exclude current lesson if editing (not new)
        const isCurrentLesson = !isNew && entry.id === lesson.id;
        return sameSlot && !isCurrentLesson;
      })
      .map((entry) => entry.teacherId)
  );

  // Filter teachers who:
  // 1. Can teach the selected subject
  // 2. Are NOT already scheduled at this timeslot
  const availableTeachers = teachers.filter((teacher) => {
    const canTeachSubject = teacher.subjects.includes(selectedSubject?.name || '');
    const isAvailable = !busyTeacherIds.has(teacher.id);
    return canTeachSubject && isAvailable;
  });

  // Separate list: teachers who can teach but are busy (for display purposes)
  const busyButQualifiedTeachers = teachers.filter((teacher) => {
    const canTeachSubject = teacher.subjects.includes(selectedSubject?.name || '');
    const isBusy = busyTeacherIds.has(teacher.id);
    return canTeachSubject && isBusy;
  });

  return (
    <Drawer open={!!lesson} onOpenChange={onClose} direction="right">
      <DrawerContent className="max-w-md flex flex-col h-full">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>
            {isNew ? 'Add New Lesson' : 'Edit Lesson'}
          </DrawerTitle>
          {/* Timeslot and Grade Info */}
          <div className="mt-3 space-y-2 pt-3 border-t">
            {timeSlot && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time Slot:</span>
                <span className="font-medium text-blue-700">
                  Period {timeSlot.periodNumber} • {timeSlot.time}
                </span>
              </div>
            )}
            {grade && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Grade:</span>
                <span className="font-medium text-purple-700">
                  {grade.displayName || grade.name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Day:</span>
              <span className="font-medium">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][lesson.dayOfWeek - 1]}
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4 overflow-y-auto flex-1">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => {
                const newSubject = subjects.find((s) => s.id === value);
                const currentTeacher = teachers.find((t) => t.id === formData.teacherId);
                
                // Check if current teacher can teach this subject and is available
                const busyTeacherIds = new Set(
                  entries
                    .filter((entry) => {
                      const sameSlot = entry.timeSlotId === lesson.timeSlotId && entry.dayOfWeek === lesson.dayOfWeek;
                      const isCurrentLesson = !lesson.isNew && entry.id === lesson.id;
                      return sameSlot && !isCurrentLesson;
                    })
                    .map((entry) => entry.teacherId)
                );

                const currentTeacherValid = 
                  newSubject &&
                  currentTeacher &&
                  currentTeacher.subjects.includes(newSubject.name) &&
                  !busyTeacherIds.has(currentTeacher.id);

                if (!currentTeacherValid) {
                  // Find first available teacher for this subject
                  const firstAvailable = teachers.find((t) => {
                    const canTeach = newSubject && t.subjects.includes(newSubject.name);
                    const isAvailable = !busyTeacherIds.has(t.id);
                    return canTeach && isAvailable;
                  });

                  setFormData({
                    ...formData,
                    subjectId: value,
                    teacherId: firstAvailable?.id || '',
                  });
                } else {
                  setFormData({ ...formData, subjectId: value });
                }
              }}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher">
              Teacher
              {availableTeachers.length > 0 && busyButQualifiedTeachers.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({availableTeachers.length} available, {busyButQualifiedTeachers.length} busy)
                </span>
              )}
            </Label>
            <Select
              value={formData.teacherId}
              onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {availableTeachers.length > 0 ? (
                  availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {teacher.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No teachers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {/* Show appropriate warning message */}
            {availableTeachers.length === 0 && (
              <div className="text-xs text-red-600 space-y-1">
                <p>⚠️ No teachers available at this time</p>
                {busyButQualifiedTeachers.length > 0 ? (
                  <p className="text-gray-600">
                    {busyButQualifiedTeachers.length} qualified teacher(s) already scheduled at this timeslot
                  </p>
                ) : (
                  <p className="text-gray-600">
                    No teachers can teach {selectedSubject?.name}
                  </p>
                )}
              </div>
            )}

            {/* Show list of busy teachers if any */}
            {busyButQualifiedTeachers.length > 0 && availableTeachers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                <p className="font-medium text-yellow-800 mb-1">Currently busy:</p>
                <ul className="text-yellow-700 space-y-0.5">
                  {busyButQualifiedTeachers.map((teacher) => (
                    <li key={teacher.id}>• {teacher.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <Label htmlFor="room">Room Number (Optional)</Label>
            <Input
              id="room"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. Room 101"
            />
          </div>

        </div>

        <DrawerFooter className="gap-2">
          <div className="flex items-center justify-between w-full">
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className={`flex gap-2 ${!isNew ? 'ml-auto' : 'ml-auto'}`}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.subjectId || !formData.teacherId}
              >
                {isNew ? 'Add Lesson' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

