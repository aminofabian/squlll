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
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Manage Teachers</h3>
        
        <div className="space-y-4">
          {Object.entries(teachers).map(([name, teacher]) => (
            <div key={name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">{name}</div>
                <div className="text-sm text-gray-600">
                  Subjects: {teacher.subjects.join(', ')}
                </div>
                {getTeacherConflictCount(name) > 0 && (
                  <div className="text-sm text-red-600">
                    {getTeacherConflictCount(name)} scheduling conflicts
                  </div>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${teacher.color}`}>
                {teacher.subjects.length} subjects
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={onAddTeacher}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 