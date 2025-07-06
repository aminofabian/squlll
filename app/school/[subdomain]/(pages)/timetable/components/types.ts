export interface LessonStats {
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