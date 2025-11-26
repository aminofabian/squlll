// lib/data/transform-mock-data.ts
// Transform old mock data to new efficient structure

import mockData from './mock-timetable-data.json';
import type {
  TimetableData,
  TimeSlot,
  Break,
  Subject,
  Teacher,
  Grade,
  TimetableEntry,
} from '../types/timetable';

/**
 * Transform the old inefficient mock data structure
 * to the new normalized structure
 */
export function transformMockData(): TimetableData {
  // 1. Transform time slots
  const timeSlots: TimeSlot[] = mockData.metadata.timeSlots.map((slot, index) => ({
    id: `slot-${index + 1}`,
    periodNumber: index + 1,
    time: slot.time,
    startTime: parseTime(slot.time).start,
    endTime: parseTime(slot.time).end,
    color: slot.color,
  }));

  // 2. Transform breaks (ONLY ONCE, not per grade!)
  const breaks: Break[] = [];
  const breakTypes = [
    { name: 'Morning Break', type: 'short_break' as const, afterPeriod: 3, duration: 15 },
    { name: 'Lunch', type: 'lunch' as const, afterPeriod: 6, duration: 45 },
    { name: 'Afternoon Break', type: 'short_break' as const, afterPeriod: 8, duration: 15 },
  ];

  let breakIndex = 0;
  for (let day = 1; day <= 5; day++) {
    for (const breakType of breakTypes) {
      breaks.push({
        id: `break-${++breakIndex}`,
        name: breakType.name,
        type: breakType.type,
        dayOfWeek: day,
        afterPeriod: breakType.afterPeriod,
        durationMinutes: breakType.duration,
        icon: breakType.type === 'lunch' ? '🍽️' : '☕',
        color: breakType.type === 'lunch' ? 'bg-orange-500' : 'bg-blue-500',
      });
    }
  }

  // 3. Extract unique subjects
  const subjectMap = new Map<string, Subject>();
  let subjectIndex = 0;

  Object.values(mockData.timetable).forEach((entry: any) => {
    if (!entry.isBreak && entry.subject && !subjectMap.has(entry.subject)) {
      subjectMap.set(entry.subject, {
        id: `subject-${++subjectIndex}`,
        name: entry.subject,
        code: entry.subject.substring(0, 4).toUpperCase(),
        color: generateColor(entry.subject),
      });
    }
  });

  const subjects = Array.from(subjectMap.values());

  // 4. Extract unique teachers
  const teacherMap = new Map<string, Teacher>();
  let teacherIndex = 0;

  Object.entries(mockData.metadata.teachers).forEach(([name, data]: [string, any]) => {
    const [firstName, ...lastNameParts] = name.split(' ');
    teacherMap.set(name, {
      id: `teacher-${++teacherIndex}`,
      firstName,
      lastName: lastNameParts.join(' '),
      name,
      subjects: data.subjects || [],
      color: data.color || 'bg-gray-600',
    });
  });

  const teachers = Array.from(teacherMap.values());

  // 5. Create grades (with Play Group, PP1, PP2 before Grade 1)
  const gradeNames = [
    'Play Group',  // Level 1 (also called Playgroup or Baby Class)
    'PP1',         // Level 2 (Pre-Primary 1)
    'PP2',         // Level 3 (Pre-Primary 2)
    'Grade 1',     // Level 4
    'Grade 2',     // Level 5
    'Grade 3',     // Level 6
    'Grade 4',     // Level 7
    'Grade 5',     // Level 8
    'Grade 6',     // Level 9
    'Grade 7',     // Level 10
    'Grade 8',     // Level 11
    'Grade 9',     // Level 12
    'Grade 10',    // Level 13
    'Grade 11',    // Level 14
    'Grade 12',    // Level 15
  ];

  const grades: Grade[] = gradeNames.map((name, index) => ({
    id: `grade-${index + 1}`,
    name,
    level: index + 1,
    displayName: getDisplayName(name),
  }));

  // 6. Transform timetable entries (SKIP breaks!)
  const entries: TimetableEntry[] = [];
  let entryIndex = 0;

  Object.entries(mockData.timetable).forEach(([cellKey, cellData]: [string, any]) => {
    // Skip breaks - they're in the breaks array now!
    if (cellData.isBreak) return;

    // Parse composite key "Grade 1-1-3" -> [gradeName, dayIndex, periodIndex]
    const [gradeName, dayIndexStr, periodIndexStr] = cellKey.split('-');
    const dayOfWeek = parseInt(dayIndexStr);
    const periodIndex = parseInt(periodIndexStr);

    // Find references
    const grade = grades.find((g) => g.name === gradeName);
    const subject = subjectMap.get(cellData.subject);
    const teacher = teacherMap.get(cellData.teacher);
    const timeSlot = timeSlots[periodIndex];

    if (grade && subject && teacher && timeSlot) {
      entries.push({
        id: `entry-${++entryIndex}`,
        gradeId: grade.id,
        subjectId: subject.id,
        teacherId: teacher.id,
        timeSlotId: timeSlot.id,
        dayOfWeek,
        roomNumber: cellData.room || `Room ${Math.floor(Math.random() * 20) + 1}`,
      });
    }
  });

  // 7. Generate mock entries for grades without data
  const gradesWithData = new Set(
    entries.map((e) => grades.find((g) => g.id === e.gradeId)?.name).filter(Boolean)
  );
  
  const gradesMissingData = grades.filter((g) => !gradesWithData.has(g.name));

  gradesMissingData.forEach((grade) => {
    // Generate sample schedule for grades without data
    const schedulePattern = generateSchedulePattern(grade.name);
    
    // Generate entries for each day
    for (let day = 1; day <= 5; day++) {
      schedulePattern.forEach(({ subjectName, periodIndex }) => {
        const subject = subjectMap.get(subjectName);
        if (!subject) return;

        // Find a teacher who can teach this subject
        const availableTeachers = teachers.filter((t) => t.subjects.includes(subjectName));
        if (availableTeachers.length === 0) return;

        const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
        const timeSlot = timeSlots[periodIndex];

        if (timeSlot) {
          entries.push({
            id: `entry-${++entryIndex}`,
            gradeId: grade.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            timeSlotId: timeSlot.id,
            dayOfWeek: day,
            roomNumber: `Room ${Math.floor(Math.random() * 20) + 1}`,
          });
        }
      });
    }
  });

  return {
    timeSlots,
    breaks,
    subjects,
    teachers,
    grades,
    entries,
    lastUpdated: new Date().toISOString(),
  };
}

// Helper function to generate schedule patterns for different grade levels
function generateSchedulePattern(gradeName: string): { subjectName: string; periodIndex: number }[] {
  // Early years (Play Group / Playgroup, PP1, PP2)
  if (['Play Group', 'PP1', 'PP2'].includes(gradeName)) {
    return [
      { subjectName: 'English', periodIndex: 0 },
      { subjectName: 'Mathematics', periodIndex: 1 },
      { subjectName: 'Art & Craft', periodIndex: 2 },
      // Periods 3-4 are breaks
      { subjectName: 'Physical Education', periodIndex: 5 },
      { subjectName: 'Music', periodIndex: 6 },
      { subjectName: 'Environmental Activities', periodIndex: 7 },
      // Period 8 is lunch
      { subjectName: 'Story Time', periodIndex: 9 },
    ];
  }

  // Primary (Grade 1-6)
  if (gradeName.startsWith('Grade') && parseInt(gradeName.split(' ')[1]) <= 6) {
    return [
      { subjectName: 'Mathematics', periodIndex: 0 },
      { subjectName: 'English', periodIndex: 1 },
      { subjectName: 'Kiswahili', periodIndex: 2 },
      // Periods 3-4 are breaks
      { subjectName: 'Science', periodIndex: 5 },
      { subjectName: 'Social Studies', periodIndex: 6 },
      { subjectName: 'CRE', periodIndex: 7 },
      // Period 8 is lunch
      { subjectName: 'Physical Education', periodIndex: 9 },
    ];
  }

  // Secondary (Grade 7-12 / Form 1-6)
  return [
    { subjectName: 'Mathematics', periodIndex: 0 },
    { subjectName: 'English', periodIndex: 1 },
    { subjectName: 'Kiswahili', periodIndex: 2 },
    // Periods 3-4 are breaks
    { subjectName: 'Physics', periodIndex: 5 },
    { subjectName: 'Chemistry', periodIndex: 6 },
    { subjectName: 'Biology', periodIndex: 7 },
    // Period 8 is lunch
    { subjectName: 'History', periodIndex: 9 },
  ];
}

// Helper functions
function parseTime(timeString: string): { start: string; end: string } {
  // "8:00 AM – 8:45 AM" -> { start: "08:00", end: "08:45" }
  const [start, end] = timeString.split('–').map((t) => t.trim());
  return {
    start: convertTo24Hour(start),
    end: convertTo24Hour(end),
  };
}

function convertTo24Hour(time: string): string {
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateColor(subject: string): string {
  // Generate consistent color based on subject name
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#F97316', // orange
  ];

  const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getDisplayName(gradeName: string): string {
  // Handle special cases
  if (gradeName === 'Play Group') return 'Playgroup';
  if (gradeName === 'PP1') return 'PP1';
  if (gradeName === 'PP2') return 'PP2';
  
  // Handle Grade 1-6 (Primary)
  if (gradeName.startsWith('Grade')) {
    const level = parseInt(gradeName.split(' ')[1]);
    if (level >= 1 && level <= 6) {
      return `P${level}`; // Grade 1 -> P1, Grade 2 -> P2, etc.
    }
    // Handle Grade 7-12 (Form/Secondary)
    if (level >= 7 && level <= 12) {
      return `F${level - 6}`; // Grade 7 -> F1, Grade 8 -> F2, etc.
    }
  }
  return gradeName;
}

// Export transformed data
export const transformedMockData = transformMockData();

// Export helper to get entries for a specific grade
export function getEntriesForGrade(
  gradeId: string,
  data: TimetableData
): TimetableEntry[] {
  return data.entries.filter((entry) => entry.gradeId === gradeId);
}

// Export helper to get breaks for a specific day
export function getBreaksForDay(dayOfWeek: number, data: TimetableData): Break[] {
  return data.breaks.filter((b) => b.dayOfWeek === dayOfWeek);
}

// Export helper to enrich entries with full data
export function enrichEntry(
  entry: TimetableEntry,
  data: TimetableData
) {
  return {
    ...entry,
    subject: data.subjects.find((s) => s.id === entry.subjectId)!,
    teacher: data.teachers.find((t) => t.id === entry.teacherId)!,
    timeSlot: data.timeSlots.find((ts) => ts.id === entry.timeSlotId)!,
    grade: data.grades.find((g) => g.id === entry.gradeId)!,
  };
}

