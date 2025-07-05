import React from 'react';
import { User } from 'lucide-react';

interface TeacherWorkloadProps {
  teacherWorkload: Record<string, number>;
  mostBusyTeacher: string;
}

export const TeacherWorkload: React.FC<TeacherWorkloadProps> = ({ 
  teacherWorkload, 
  mostBusyTeacher 
}) => {
  const maxLessons = Math.max(...Object.values(teacherWorkload), 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Teacher Workload
      </h3>
      
      <div className="space-y-3">
        {Object.entries(teacherWorkload)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([teacher, lessons]) => (
            <div key={teacher} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {teacher.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{teacher}</p>
                  <p className="text-xs text-gray-500">{lessons} lessons</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(lessons / maxLessons) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        
        {mostBusyTeacher !== 'None' && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">🏆 Most Active: {mostBusyTeacher}</p>
            <p className="text-xs text-primary/70">{teacherWorkload[mostBusyTeacher]} lessons this week</p>
          </div>
        )}
      </div>
    </div>
  );
}; 