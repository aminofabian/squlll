import React from 'react';
import { WeeklyOverview } from './WeeklyOverview';
import { TeacherWorkload } from './TeacherWorkload';
import { ScheduleAnalysis } from './ScheduleAnalysis';

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

interface LessonSummaryPanelProps {
  stats: LessonStats;
}

export const LessonSummaryPanel: React.FC<LessonSummaryPanelProps> = ({ stats }) => {
  return (
    <div className="w-80 space-y-6">
      <WeeklyOverview stats={stats} />
      <TeacherWorkload 
        teacherWorkload={stats.teacherWorkload} 
        mostBusyTeacher={stats.mostBusyTeacher} 
      />
      <ScheduleAnalysis
        dayDistribution={stats.dayDistribution}
        timeSlotUsage={stats.timeSlotUsage}
        subjectDistribution={stats.subjectDistribution}
        mostBusyDay={stats.mostBusyDay}
        mostBusyTime={stats.mostBusyTime}
        doubleLessons={stats.doubleLessons}
        completionPercentage={stats.completionPercentage}
        averageLessonsPerDay={stats.averageLessonsPerDay}
      />
    </div>
  );
}; 