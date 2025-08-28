"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";

// Teacher type definition (simplified for table use)
type Teacher = {
  id: string;
  name: string;
  designation: string;
  department: string;
  subjects: string[];
  employeeId: string;
  photo?: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired";
  performance?: {
    rating: number;
  };
};

interface TeachersTableProps {
  teachers: Teacher[];
  onTeacherSelect: (teacherId: string) => void;
}

export function TeachersTable({ teachers, onTeacherSelect }: TeachersTableProps) {
  if (teachers.length === 0) {
    return (
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">All Teachers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Showing 0 teachers
            </p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No teachers found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Try adjusting your search criteria or add a new teacher.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">All Teachers</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Showing {teachers.length} teachers
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-primary/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-primary/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {teachers.map((teacher) => (
                <tr 
                  key={teacher.id}
                  className="hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => onTeacherSelect(teacher.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {teacher.photo ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={teacher.photo} 
                            alt={teacher.name} 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {teacher.designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                      {teacher.department}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-slate-100">
                    {teacher.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {teacher.performance?.rating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <div 
                              key={index} 
                              className={`h-2 w-2 rounded-full ${
                                index < teacher.performance!.rating ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                          {teacher.performance.rating}/5
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No rating</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        teacher.status === 'active' ? 'bg-green-500' : 
                        teacher.status === 'on leave' ? 'bg-yellow-500' : 
                        teacher.status === 'former' ? 'bg-gray-400' :
                        teacher.status === 'substitute' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`} />
                      <Badge variant="outline" className={`
                        text-xs ${
                          teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          teacher.status === 'on leave' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          teacher.status === 'former' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          teacher.status === 'substitute' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }
                      `}>
                        {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
