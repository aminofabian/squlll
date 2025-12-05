import React from 'react';
import { Plus } from 'lucide-react';

interface Teacher {
  id: number;
  subjects: string[];
  color: string;
}

interface TeacherManagementModalProps {
  isOpen: boolean;
  teachers: Record<string, Teacher>;
  onClose: () => void;
  onAddTeacher: () => void;
  getTeacherConflictCount: (teacher: string) => number;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  isOpen,
  teachers,
  onClose,
  onAddTeacher,
  getTeacherConflictCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-300 dark:border-slate-600 flex flex-col">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Manage Teachers</h3>
        
        <div className="space-y-3 flex-1 overflow-y-auto">
          {Object.entries(teachers).map(([name, teacher]) => (
            <div key={name} className="flex items-center justify-between p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Subjects: {teacher.subjects.join(', ')}
                </div>
                {getTeacherConflictCount(name) > 0 && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {getTeacherConflictCount(name)} scheduling conflicts
                  </div>
                )}
              </div>
              <div className={`px-3 py-1 text-sm ${teacher.color}`}>
                {teacher.subjects.length} subjects
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-300 dark:border-slate-600">
          <button
            onClick={onAddTeacher}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium hover:bg-primary/90 transition-colors h-10 rounded"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 